import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** The `Drawer.Content` panel opened via `BasePage.openCart()`. Not a
 * `BasePage` subclass — it's a transient overlay, not a route. */
export class CartDrawer {
  constructor(private readonly page: Page) {}

  async waitForOpen() {
    await expect(this.page.getByRole('button', { name: 'Close cart' })).toBeVisible();
  }

  async close() {
    await this.page.getByRole('button', { name: 'Close cart' }).click();
  }

  itemRow(title: string) {
    return this.page.getByRole('article').filter({ hasText: title });
  }

  async increaseQuantity(title: string) {
    await this.itemRow(title).getByRole('button', { name: 'Increase quantity' }).click();
  }

  async decreaseQuantity(title: string) {
    await this.itemRow(title).getByRole('button', { name: 'Decrease quantity' }).click();
  }

  async removeItem(title: string) {
    await this.itemRow(title).getByRole('button', { name: 'Remove item' }).click();
  }

  /** The size value is a bare digit too, so the quantity carries a
   * `data-testid` (AGENTS.md's carve-out for duplicated, unnamed text). */
  quantityOf(title: string) {
    return this.itemRow(title).getByTestId('cart-item-quantity');
  }

  get total() {
    return this.page.getByTestId('cart-total');
  }

  get checkoutButton() {
    return this.page.getByRole('button', { name: 'Proceed to Checkout' });
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async expectEmpty() {
    await expect(this.page.getByRole('heading', { name: 'Your cart is empty' })).toBeVisible();
  }
}
