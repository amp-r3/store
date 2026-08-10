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

  async addToCart() {
    await this.purchaseBox.getByRole('button', { name: 'Add to Cart' }).click();
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
