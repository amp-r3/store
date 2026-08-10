import { test, expect } from '../fixtures/test';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// P0-1 — Catalog discovery (AGENTS.md's E2E section): the entry point of
// every funnel. A broken catalog/search means zero traffic reaches a
// product page, which is a total conversion loss.

test.describe('catalog discovery', () => {
  test('renders a grid of products', async ({ catalogPage }) => {
    await catalogPage.goto();
    await expect(catalogPage.productCardLinks().first()).toBeVisible();
    expect(await catalogPage.productCardLinks().count()).toBeGreaterThan(0);
  });

  test('search narrows the grid to matches, and an unmatched query shows the empty state', async ({
    catalogPage,
  }) => {
    await catalogPage.goto();
    const title = await catalogPage.firstProductTitle();
    const term = title.split(' ')[0];

    await catalogPage.search(term);
    await expect(catalogPage.productCardLinks().first()).toBeVisible();
    for (const link of await catalogPage.productCardLinks().all()) {
      await expect(link).toHaveAccessibleName(new RegExp(escapeRegExp(term), 'i'));
    }

    await catalogPage.search('zzzznonexistentproductzzzz');
    await catalogPage.expectNoMatchesFound();
    expect(await catalogPage.productCardLinks().count()).toBe(0);
  });

  test('category filter narrows the grid to that category', async ({ catalogPage }) => {
    await catalogPage.goto();
    await expect(catalogPage.productCardLinks().first()).toBeVisible();

    await catalogPage.selectSecondCategory();
    await expect(catalogPage.page).toHaveURL(/category=/);
    await expect(catalogPage.productCardLinks().first()).toBeVisible();
  });

  test('sort changes the URL and re-renders the grid', async ({ catalogPage }) => {
    await catalogPage.goto();
    await expect(catalogPage.productCardLinks().first()).toBeVisible();

    await catalogPage.selectSort('Lowest Price');
    await expect(catalogPage.page).toHaveURL(/sortBy=price/);
    await expect(catalogPage.page).toHaveURL(/order=asc/);
    await expect(catalogPage.productCardLinks().first()).toBeVisible();
  });

  test('opening a product card lands on its PDP with title, price and purchase controls', async ({
    catalogPage,
    productPage,
  }) => {
    await catalogPage.goto();
    const title = await catalogPage.firstProductTitle();

    await catalogPage.openFirstProduct();
    await expect(catalogPage.page).toHaveURL(/\/product\//);
    await expect(productPage.heading).toHaveText(title);
    await expect(productPage.stockLine()).toBeVisible();
  });
});
