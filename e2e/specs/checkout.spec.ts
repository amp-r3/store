import { test, expect } from '../fixtures/test';

// P0-4 — Full conversion (AGENTS.md's E2E section): the money path. The
// only test that exercises `create_order` end to end — stock locking,
// delivery/payment fee computation, order_number generation, cart
// clearing. Runs authenticated (`chromium-auth` project); real writes are
// undone by `e2e/global.teardown.ts`.

test('signed-in user completes checkout and the order appears in order history', async ({
  catalogPage,
  productPage,
  cartDrawer,
  checkoutPage,
  ordersPage,
  page,
}) => {
  await catalogPage.goto();
  await catalogPage.openFirstProduct();
  await productPage.selectFirstAvailableSize();
  await productPage.addToCart();

  await productPage.openCart();
  await cartDrawer.waitForOpen();
  await cartDrawer.proceedToCheckout();
  await expect(page).toHaveURL(/\/checkout(\?|$)/);

  // Submitting the Contacts step empty must block progress with visible
  // field errors before any valid data is entered.
  await checkoutPage.continueToDelivery();
  await expect(checkoutPage.fieldError(/first name/i)).toBeVisible();

  await checkoutPage.fillContacts({
    firstName: 'Jamie',
    lastName: 'Doe',
    email: 'jamie.doe@example.com',
    phone: '+15551234567',
  });
  await checkoutPage.continueToDelivery();

  await checkoutPage.selectDelivery('Standard');
  await checkoutPage.fillShipping({
    country: 'United States',
    city: 'New York',
    street: '123 Main Street',
    housenumber: '67',
    postcode: '10001',
  });
  await checkoutPage.continueToPayment();

  await checkoutPage.selectPayment('Online');

  const orderResponsePromise = page.waitForResponse((response) =>
    /\/rest\/v1\/rpc\/create_order/.test(response.url()),
  );
  await checkoutPage.placeOrder();
  await orderResponsePromise;

  const orderNumber = await checkoutPage.expectOrderConfirmed();
  expect(orderNumber).toBeTruthy();

  await page.getByRole('button', { name: 'My Orders' }).click();
  await expect(page).toHaveURL(/\/user\/orders/);
  await ordersPage.expectOrderPresent(orderNumber as string);
});
