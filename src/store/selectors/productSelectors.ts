import { createSelector } from "reselect";


// --- SELECTORS ---

// Basic selectors (extract raw data)
const selectProductsObject = (state) => state.products.products;

// turns an object into an array
export const selectAllProducts = createSelector(
  [selectProductsObject],
  (productsObject) => Object.values(productsObject)
);
