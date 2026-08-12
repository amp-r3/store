import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(id: string | number) {
    await this.navigate(`/product/${id}`);
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  private get purchaseBox() {
    return this.page.locator('#product-purchase-box');
  }

  private get sizeList() {
    return this.page.locator('#product-sizes');
  }

  /** Selects the first in-stock size, or does nothing for a "One Size"
   * product (auto-selected — `ProductSummary` still renders the
   * `#product-sizes` wrapper whenever `sizes.length > 0`, but `ProductSizes`
   * itself renders no options for it). */
  async selectFirstAvailableSize() {
    // The PDP arrives via a client-side navigation, so nothing of it is in
    // the DOM when this is called. Wait on a web-first assertion before
    // counting anything: a bare `count()` here can resolve against the
    // *catalog* page, return 0, and skip the selection — leaving the button
    // labelled "Select Size", which the "Add to Cart" locator can never
    // match.
    await expect(this.purchaseBox).toBeVisible();

    const options = this.sizeList.locator('button:not([disabled])');

    if ((await options.count()) === 0) {
      await expect(this.stockLine()).not.toHaveAttribute('data-stock', 'select-size');
      return;
    }

    const option = options.first();
    await option.click();
    await expect(option).toHaveAttribute('aria-pressed', 'true');
  }

  /** Scoped to `#product-purchase-box`: MobileBar renders a second, icon-only
   * "Add to Cart" with the same accessible name whenever it is mounted
   * (≤525px, `MainLayout`), and neither `:visible` nor `getByRole` filters it
   * out — its inactive layer is `opacity: 0`, and Playwright has no `inert`
   * support, so an unscoped query can resolve to both. */
  private get addToCartButton(): Locator {
    return this.purchaseBox.getByRole('button', { name: 'Add to Cart' });
  }

  async addToCart() {
    // Assert `enabled` before scrolling: with no size selected the button is
    // *renamed* to "Select Size" (AddToCartButton.tsx's `isLoading` prop is
    // never wired, so a resolved "Add to Cart" locator is never actually
    // disabled) — an unresolved locator should fail here, not inside
    // `scrollIntoViewIfNeeded`. See `playwright.config.ts`'s `reducedMotion`
    // for why the element's bounding box can otherwise never "settle" long
    // enough to pass the click's stability check.
    await expect(this.addToCartButton).toBeEnabled();
    await this.addToCartButton.scrollIntoViewIfNeeded();
    await this.addToCartButton.click();
    // The counter layer replaces the add button once quantity > 0 — confirms
    // the click actually landed before the caller moves on.
    await expect(this.cartQuantity()).not.toHaveText('0');
  }

  stockLine() {
    return this.purchaseBox.locator('[data-stock]');
  }

  /** The counter's quantity is a bare number between the "Remove from
   * cart"/"Add more" buttons — the only bare-digit text node in the box. */
  cartQuantity() {
    return this.purchaseBox.getByText(/^\d+$/, { exact: true });
  }
}
