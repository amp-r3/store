import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

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

  /** `CheckoutSection` keeps all three steps mounted; only the active one is
   * expanded and non-`inert` (`data-state`, CheckoutSection.tsx). Asserting it
   * here turns "a previous step silently failed to validate" into a named
   * failure instead of a click/check timeout on a collapsed section. */
  private async activeStep(name: 'contacts' | 'delivery' | 'payment') {
    const section = this.step(name);
    await expect(section).toHaveAttribute('data-state', 'active');
    return section;
  }

  /** `RadioCard` hides its real `<input>` with `clip-path: inset(50%)` — it's
   * visible but not hit-testable, so Playwright's hit test lands on the
   * wrapping `<label>` and `.check()` retries until timeout. Click the label
   * instead, the way a user actually would. Not `section.locator('label')
   * .filter({ has: radio })`: `radio` is chained off `section`, so its
   * internal selector re-embeds `section`'s own testid prefix — which
   * never appears *inside* a candidate label's subtree, so the filter
   * always resolves to zero matches (verified: label count 7, radio count
   * 1, filtered count 0). Walking from the radio up to its ancestor
   * `<label>` sidesteps that scoping quirk entirely. */
  private async selectRadioCard(section: Locator, labelSubstring: string) {
    const radio = section.getByRole('radio', { name: new RegExp(labelSubstring) });
    await radio.locator('xpath=ancestor::label[1]').click();
    await expect(radio).toBeChecked();
  }

  async fillContacts(input: ContactsInput) {
    const section = await this.activeStep('contacts');
    await section.getByLabel('First name').fill(input.firstName);
    await section.getByLabel('Last name').fill(input.lastName);
    await section.getByLabel('Email').fill(input.email);
    await section.getByLabel('Phone').pressSequentially(input.phone);
  }

  async continueToDelivery() {
    const section = await this.activeStep('contacts');
    await section.getByRole('button', { name: 'Continue to Delivery' }).click();
  }

  async selectDelivery(labelSubstring: string) {
    await this.selectRadioCard(await this.activeStep('delivery'), labelSubstring);
  }

  async fillShipping(input: ShippingInput) {
    const section = await this.activeStep('delivery');
    await section.getByLabel('Country').fill(input.country);
    await section.getByLabel('City').fill(input.city);
    await section.getByLabel('Street Address').fill(input.street);
    await section.getByLabel('House number').fill(input.housenumber);
    await section.getByLabel('ZIP / Postal Code').pressSequentially(input.postcode);
  }

  async continueToPayment() {
    const section = await this.activeStep('delivery');
    await section.getByRole('button', { name: 'Continue to Payment' }).click();
  }

  async selectPayment(labelSubstring: string) {
    await this.selectRadioCard(await this.activeStep('payment'), labelSubstring);
  }

  async placeOrder() {
    const section = await this.activeStep('payment');
    await section.getByRole('button', { name: 'Place Order' }).click();
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
