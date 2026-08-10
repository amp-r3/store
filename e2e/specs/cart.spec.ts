import { test, expect } from '../fixtures/test';

// P0-2 — Guest cart lifecycle (AGENTS.md's E2E section): captured purchase
// intent. A silent rehydration/sizeId-keying regression destroys
// conversion with no error surfaced to anyone.

test.describe('guest cart lifecycle', () => {
  test('add to cart, adjust quantity, persist across reload, and bounce to login at checkout', async ({
    page,
    catalogPage,
    productPage,
    cartDrawer,
  }) => {
    await catalogPage.goto();
    const title = await catalogPage.firstProductTitle();
    await catalogPage.openFirstProduct();

    await productPage.selectFirstAvailableSize();
    await productPage.addToCart();
    await expect(productPage.cartQuantity()).toHaveText('1');

    await productPage.openCart();
    await cartDrawer.waitForOpen();
    await expect(cartDrawer.itemRow(title)).toBeVisible();
    await expect(cartDrawer.quantityOf(title)).toHaveText('1');

    await cartDrawer.increaseQuantity(title);
    await expect(cartDrawer.quantityOf(title)).toHaveText('2');
    await cartDrawer.decreaseQuantity(title);
    await expect(cartDrawer.quantityOf(title)).toHaveText('1');

    await expect(productPage.cartBadgeCount()).toHaveText('1');
    await cartDrawer.close();

    // redux-persist keeps the guest cart in localStorage — a reload must
    // not lose it (see AGENTS.md's `persist:cart`).
    await page.reload();
    await productPage.openCart();
    await cartDrawer.waitForOpen();
    await expect(cartDrawer.itemRow(title)).toBeVisible();
    await expect(cartDrawer.quantityOf(title)).toHaveText('1');

    // `/checkout` is guarded server-side (`proxy.ts`) — a guest is bounced
    // to login with the return path preserved.
    await cartDrawer.proceedToCheckout();
    await expect(page).toHaveURL(/\/login\?from=%2Fcheckout/);
  });

  test('removing the only item shows the empty cart state', async ({
    catalogPage,
    productPage,
    cartDrawer,
  }) => {
    await catalogPage.goto();
    const title = await catalogPage.firstProductTitle();
    await catalogPage.openFirstProduct();

    await productPage.selectFirstAvailableSize();
    await productPage.addToCart();
    await productPage.openCart();
    await cartDrawer.waitForOpen();

    await cartDrawer.removeItem(title);
    await expect(cartDrawer.itemRow(title)).toBeHidden();
  });
});
