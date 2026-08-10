import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CatalogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(query?: Record<string, string>) {
    const qs = query ? `?${new URLSearchParams(query).toString()}` : '';
    await this.navigate(`/catalog${qs}`);
  }

  /** Two `SearchForm`s (Navbar + MobileBar) share `id="input"` — only one
   * is CSS-visible per viewport. */
  private get searchInput() {
    return this.page.locator('#input:visible');
  }

  private get sortButton() {
    return this.page.getByRole('button', { name: /^Sort by:/ });
  }

  private get categoryButton() {
    return this.page.getByRole('button', { name: /^Category:/ });
  }

  /** Product cards link to `/product/[id]` with a unique "View details for
   * {title}" accessible name — that link is the whole clickable card. */
  productCardLinks() {
    return this.page.getByRole('link', { name: /^View details for/ });
  }

  /** MobileBar keeps its search layer `inert` (opacity 0, pointer-events none)
   * until the dock's "Open search" button is tapped. Playwright still matches
   * the input inside it — it has no `inert` support — but it cannot be
   * focused, so typing never reaches React. No-op on desktop (MobileBar is
   * not mounted) and on a second search in the same test (layer already
   * open). */
  private async openMobileSearchIfNeeded() {
    const isInert = await this.searchInput.evaluate((el) => !!el.closest('[inert]'));
    if (!isInert) return;
    await this.page.getByRole('button', { name: 'Open search' }).click();
    await expect
      .poll(async () => this.searchInput.evaluate((el) => !!el.closest('[inert]')))
      .toBe(false);
  }

  async search(query: string) {
    await this.openMobileSearchIfNeeded();
    // `useSearch`'s 300 ms debounce on the input's `onChange` is the only path
    // that writes `?q=` on `/catalog` — `submitSearch()` early-returns there,
    // so pressing Enter cannot help and on mobile it closes the search layer.
    await this.searchInput.fill(query);
    await expect(this.page).toHaveURL(new RegExp(`q=${encodeURIComponent(query)}`));
  }

  async clearSearch() {
    await this.page.getByRole('button', { name: 'Clear search' }).click();
  }

  async selectSort(label: string) {
    await this.sortButton.click();
    await this.page.getByRole('option', { name: label }).click();
    // 150 ms debounce before the sort param actually changes.
    await expect(this.sortButton).toHaveAttribute('aria-label', `Sort by: ${label}`);
  }

  async selectCategory(name: string) {
    await this.categoryButton.click();
    await this.page.getByRole('button', { name, exact: true }).click();
    await expect(this.categoryButton).toHaveAttribute('aria-label', `Category: ${name}`);
  }

  async openFirstProduct() {
    await this.productCardLinks().first().click();
    // `next/link` client-side nav — `click()` returns before the PDP renders,
    // and the next POM call must not race it.
    await expect(this.page).toHaveURL(/\/product\/\d+/);
  }

  /** Strips the "View details for " prefix off the first card's accessible
   * name — used to derive a real search term without hardcoding seed data. */
  async firstProductTitle(): Promise<string> {
    const name = await this.productCardLinks().first().getAttribute('aria-label');
    return (name ?? '').replace(/^View details for /, '');
  }

  /** Category buttons in the open popup/overlay carry `aria-pressed`; index
   * 0 is the injected "All Products" pseudo-category (AGENTS.md), so this
   * picks the first *real* one without hardcoding seed data. Returns its
   * name. Scoped to the "Category" dialog (`CategoryPopup`/`CategoryOverlay`
   * both title themselves that way) rather than a bare `button[aria-pressed]`
   * — unscoped, that selector also matches `ControlPanel`'s "Deals" toggle,
   * which carries the same attribute. */
  async selectSecondCategory(): Promise<string> {
    await this.categoryButton.click();
    const dialog = this.page.getByRole('dialog', { name: 'Category' });
    const options = dialog.locator('button[aria-pressed]');
    await expect(options.nth(1)).toBeVisible();
    const name = (await options.nth(1).textContent())?.trim() ?? '';
    await options.nth(1).click();
    await expect(this.categoryButton).toHaveAttribute('aria-label', `Category: ${name}`);
    return name;
  }

  async expectNoMatchesFound() {
    await expect(this.page.getByRole('heading', { name: 'No matches found' })).toBeVisible();
  }

  /** Waits for the grid to finish re-rendering: RTK Query keeps the previous
   * result on screen while refetching, so `productCardLinks().all()` otherwise
   * snapshots stale cards. Polling every card (not just the first) is what
   * makes this a real wait — the term is derived from the first card's title,
   * so the pre-search first card already matches it. */
  async expectAllCardsToMatch(term: string) {
    const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    await expect
      .poll(async () => {
        const labels = await this.productCardLinks().evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute('aria-label') ?? ''),
        );
        return labels.length > 0 && labels.every((label) => pattern.test(label));
      })
      .toBe(true);
  }
}
