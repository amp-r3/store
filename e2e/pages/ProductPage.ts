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

  /** True when the product has real sizes to pick from — a single "One
   * Size" product renders no size list at all and auto-selects it. */
  async hasSelectableSizes() {
    return (await this.sizeList.count()) > 0;
  }

  /** Selects the first in-stock size, or does nothing for a "One Size"
   * product (auto-selected, no `#product-sizes` block rendered). */
  async selectFirstAvailableSize() {
    if (!(await this.hasSelectableSizes())) return;
    const options = this.sizeList.getByRole('option').filter({
      has: this.page.locator('button:not([disabled])'),
    });
    await expect(options.first()).toBeVisible();
    await options.first().locator('button').click();
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
    // `click()` alone already auto-scrolls and re-checks actionability, but
    // doing it explicitly first, plus asserting `enabled` (disabled while
    // `isLoading`/out of stock/max quantity reached — AddToCartButton.tsx),
    // turns a real state bug into a clear assertion failure instead of a
    // generic click timeout indistinguishable from a covered/unstable
    // element. See `playwright.config.ts`'s `reducedMotion` for why the
    // element's bounding box can otherwise never "settle" long enough to
    // pass the click's stability check.
    await this.addToCartButton.scrollIntoViewIfNeeded();
    await expect(this.addToCartButton).toBeEnabled();
    await this.addToCartButton.click();
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
