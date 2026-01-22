import { createSelector } from "reselect";


// --- SELECTORS ---

// Basic selectors (extract raw data)
const selectProductsObject = (state) => state.products.products;
const selectSearchResults = (state) => state.products.searchResults;

// turns an object into an array
export const selectAllProducts = createSelector(
  [selectProductsObject],
  (productsObject) => Object.values(productsObject)
);

// Helper for checking search activity
export const selectIsSearchActive = createSelector(
  [selectSearchResults],
  (searchResults) => searchResults !== null
);

// Returns the required data
export const selectCatalogDisplayData = createSelector(
  [selectSearchResults, selectAllProducts],
  (searchResults, allProducts) => {
    if (searchResults !== null) {
      return searchResults;
    }
    return allProducts;
  }
);