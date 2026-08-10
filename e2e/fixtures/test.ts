import { test as base } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductPage } from '../pages/ProductPage';
import { CartDrawer } from '../pages/CartDrawer';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { OrdersPage } from '../pages/OrdersPage';

interface Fixtures {
  catalogPage: CatalogPage;
  productPage: ProductPage;
  cartDrawer: CartDrawer;
  loginPage: LoginPage;
  checkoutPage: CheckoutPage;
  ordersPage: OrdersPage;
}

export const test = base.extend<Fixtures>({
  catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartDrawer: async ({ page }, use) => use(new CartDrawer(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  ordersPage: async ({ page }, use) => use(new OrdersPage(page)),
});

export { expect } from '@playwright/test';
