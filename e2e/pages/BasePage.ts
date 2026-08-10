import type { Page } from '@playwright/test';

/** Shared header actions available on every storefront page. Desktop
 * `Navbar` and `MobileBar` both mount in the DOM regardless of viewport
 * (CSS hides the inactive one), so header controls carry the same
 * `data-testid` in both and are disambiguated with Playwright's `:visible`
 * pseudo-class rather than by picking one accessible name over the other. */
export class BasePage {
  constructor(readonly page: Page) {}

  /** Named to avoid clashing with subclasses' `goto` overloads (e.g.
   * `CatalogPage.goto(query?)`, `ProductPage.goto(id)`) — TS won't allow a
   * subclass method to narrow/change a base method's parameter type. */
  protected async navigate(path: string) {
    await this.page.goto(path);
  }

  private get cartOpenButton() {
    return this.page.locator('[data-testid="cart-open"]:visible');
  }

  async openCart() {
    await this.cartOpenButton.click();
  }

  /** The badge only renders once redux-persist rehydrates and count >= 1
   * (see AGENTS.md / `useIsRehydrated`) — absent otherwise, not "0". */
  cartBadgeCount() {
    return this.cartOpenButton.locator('span');
  }
}
