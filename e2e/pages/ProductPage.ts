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
    // MobileBar is a fixed bottom dock above the page in z-order, so
    // Playwright's minimal scroll-into-view can leave this button beneath it
    // and the click retries on hit-target until it times out. Centring also
    // brings the purchase box on screen, which flips the dock back to its nav
    // layer (`useOnScreen('product-purchase-box')` in `MobileBar.tsx`).
    await this.addToCartButton.evaluate((el) => el.scrollIntoView({ block: 'center' }));
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
