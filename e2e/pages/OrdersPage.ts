import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** `/user/orders` — protected by `proxy.ts` + `ProtectedRoute`. */
export class OrdersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/user/orders');
  }

  orderRow(orderNumber: string) {
    return this.page.getByRole('listitem').filter({ hasText: `#${orderNumber}` });
  }

  async expectOrderPresent(orderNumber: string) {
    await expect(this.orderRow(orderNumber)).toBeVisible();
  }
}
