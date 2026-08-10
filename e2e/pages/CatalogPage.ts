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

  async search(query: string) {
    await this.searchInput.fill(query);
    // `/catalog`'s debounced auto-search (AGENTS.md, 300 ms) should update
    // the URL from the fill alone, but submitting is the same code path
    // the app itself defines for triggering a search and removes any
    // dependency on the debounce's timing/focus state — belt and braces.
    await this.searchInput.press('Enter');
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
}
