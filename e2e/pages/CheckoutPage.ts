import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export interface ContactsInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ShippingInput {
  country: string;
  city: string;
  street: string;
  housenumber: string;
  postcode: string;
}

/** `/checkout` — a 3-step form (`?step=contacts|delivery|payment`) that can
 * only be reached via the cart (`CheckoutGuard` bounces a direct visit with
 * no items, see AGENTS.md). Imask-driven fields (`Phone`, `ZIP / Postal
 * Code`) need `pressSequentially`, not `fill` — imask parses keystrokes. */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  private step(name: 'contacts' | 'delivery' | 'payment') {
    return this.page.getByTestId(`checkout-step-${name}`);
  }

  async fillContacts(input: ContactsInput) {
    const section = this.step('contacts');
    await section.getByLabel('First name').fill(input.firstName);
    await section.getByLabel('Last name').fill(input.lastName);
    await section.getByLabel('Email').fill(input.email);
    await section.getByLabel('Phone').pressSequentially(input.phone);
  }

  async continueToDelivery() {
    await this.step('contacts').getByRole('button', { name: 'Continue to Delivery' }).click();
  }

  async selectDelivery(labelSubstring: string) {
    await this.step('delivery')
      .getByRole('radio', { name: new RegExp(labelSubstring) })
      .check();
  }

  async fillShipping(input: ShippingInput) {
    const section = this.step('delivery');
    await section.getByLabel('Country').fill(input.country);
    await section.getByLabel('City').fill(input.city);
    await section.getByLabel('Street Address').fill(input.street);
    await section.getByLabel('House number').fill(input.housenumber);
    await section.getByLabel('ZIP / Postal Code').pressSequentially(input.postcode);
  }

  async continueToPayment() {
    await this.step('delivery').getByRole('button', { name: 'Continue to Payment' }).click();
  }

  async selectPayment(labelSubstring: string) {
    await this.step('payment')
      .getByRole('radio', { name: new RegExp(labelSubstring) })
      .check();
  }

  async placeOrder() {
    await this.step('payment').getByRole('button', { name: 'Place Order' }).click();
  }

  fieldError(text: string | RegExp) {
    return this.page.getByRole('alert').filter({ hasText: text });
  }

  async expectOrderConfirmed() {
    await expect(this.page).toHaveURL(/\/checkout\/success\?order=/);
    const orderNumber = new URL(this.page.url()).searchParams.get('order');
    await expect(this.page.getByRole('dialog')).toContainText(`Order №${orderNumber}`);
    return orderNumber;
  }
}
