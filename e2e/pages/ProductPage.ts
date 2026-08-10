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

  /** Not scoped to `#product-purchase-box`: on mobile that box can start
   * below the fold behind `MobileBar`'s fixed dock, which renders its own
   * "Add to Cart" (icon-only, same accessible name) for the active
   * product. Only one of the two is ever actionable at a time — the
   * inactive one sits in an `inert` container, which excludes it from the
   * accessibility tree — so the global role query naturally resolves to
   * whichever is currently interactive; `.first()` is a safety net. */
  async addToCart() {
    await this.page.getByRole('button', { name: 'Add to Cart' }).first().click();
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
