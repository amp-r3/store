import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Shared header actions available on every storefront page. Desktop `Navbar`
 * is CSS-hidden at narrow widths (`display: none`); `MobileBar` is JS-gated
 * instead — mounted only at <=525px (`MainLayout`). Both carry the same
 * `data-testid` for their cart button, disambiguated with Playwright's
 * `:visible` pseudo-class rather than by picking one accessible name over the
 * other. */
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

  /** On a PDP at mobile widths, `MobileBar` swaps its nav dock (holding
   * `cart-open`) for a purchase layer once `#product-purchase-box` nears the
   * bottom of the viewport. The dock stays in the DOM but goes `inert`
   * (opacity 0 / pointer-events none) in the same grid cell the purchase
   * layer occupies, which then intercepts the click — Playwright has no
   * `inert` support, and `opacity: 0` still counts as visible. Its "Back to
   * navigation" button pins the dock back; no-op on desktop (MobileBar isn't
   * mounted) and off a product page (dock is never inert there). */
  private async ensureNavDock() {
    await expect(this.cartOpenButton).toBeVisible();
    const isInert = () => this.cartOpenButton.evaluate((el) => !!el.closest('[inert]'));
    if (await isInert()) {
      await this.page.getByRole('button', { name: 'Back to navigation' }).click();
      await expect.poll(isInert).toBe(false);
    }

    // `useHideOnScroll` independently hides the whole bar behind a
    // translate3d transform once the page has scrolled down (e.g. a prior
    // `ProductPage.addToCart()`'s `scrollIntoViewIfNeeded`) — CSS
    // visibility/display stay untouched, so it still reads as "visible" to
    // Playwright while off-screen, and fixed positioning means the click's
    // own "scroll into view" can't undo it. Scrolling to the very top
    // unconditionally re-shows it (`useHideOnScroll`'s TOP_THRESHOLD).
    const inViewport = await this.cartOpenButton.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    if (!inViewport) {
      await this.page.evaluate(() => window.scrollTo(0, 0));
      await expect(this.cartOpenButton).toBeInViewport();
    }
  }

  async openCart() {
    await this.ensureNavDock();
    await this.cartOpenButton.click();
  }

  /** The badge only renders once redux-persist rehydrates and count >= 1
   * (see AGENTS.md / `useIsRehydrated`) — absent otherwise, not "0". */
  cartBadgeCount() {
    return this.cartOpenButton.locator('span');
  }
}
