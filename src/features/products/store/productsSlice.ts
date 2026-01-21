import { createAsyncThunk, createSlice, isRejected } from '@reduxjs/toolkit'
import { getProducts as fetchProducts, getProductById as fetchProductsById } from '../api'
import { createSelector } from 'reselect'
import { ProductStateType } from '@/types/productStateType'
import { ProductParams } from '../api/productsApi'

// Async request to get an array of products
export const getProducts = createAsyncThunk('products/getProducts',
  async (params: ProductParams, { rejectWithValue }) => {
    try {

      const requestParams = {
        page: params.page || 1, 
        ...params
      };

      const response = await fetchProducts(requestParams)
      if (response) {
        const { products, total } = response.data
        return { products, total, isSearch: !!requestParams.search }
      }
      else {
        throw Error('Ошибка HTTP!')
      }
    }
    catch (e) {
      console.error('Не удалось получить данные!', e)
      return rejectWithValue(e)
    }
  }
)

// Async request to get a single object by its id
export const getProductsById = createAsyncThunk('products/getProductsById',
  async (product: string, { rejectWithValue }) => {
    try {
      const response = await fetchProductsById(product)
      if (response) {
        const product = response.data
        return product
      }
      else {
        throw Error('Ошибка HTTP!')
      }
    } catch (error) {
      console.error('Не удалось получить данные!', error);
      return rejectWithValue(error)
    }
  }
)

const initialState: ProductStateType = {
  products: {},
  total: 0,
  searchResults: null,
  status: 'idle',
  searchStatus: 'idle',
  error: null
}

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearSearch(state) {
      state.searchResults = null
      state.searchStatus = 'idle'
    }
  },
  extraReducers: (builder) => {
    // Process getProducts
    builder.addCase(getProducts.fulfilled, (state, action) => {
      const { products, isSearch, total } = action.payload;
      state.total = total
      if (isSearch) {
        // If this is a search, save it in searchResults
        state.searchStatus = 'succeeded';
        state.searchResults = products;
      } else {
        // If it's a regular list, save it in products
        state.status = 'succeeded';
        state.products = products.reduce((accumulator, currentProduct) => {
          accumulator[currentProduct.id] = currentProduct;
          return accumulator;
        }, {});
      }
    });

    builder.addCase(getProductsById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const newProduct = action.payload;
      state.products[newProduct.id] = newProduct;
    });

    // Pending for getProducts
    builder.addCase(getProducts.pending, (state, action) => {
      state.error = null;
      const params = action.meta.arg;

      // Defining a status update based on parameters
      if (params.search) {
        state.searchStatus = 'loading';
      } else {
        state.status = 'loading';
      }
    });

    // Pending for getProductsById
    builder.addCase(getProductsById.pending, (state) => {
      state.error = null;
      state.status = 'loading';
    });

    // Rejected
    builder.addMatcher(isRejected, (state, action) => {
      state.status = 'failed';
      state.searchStatus = 'failed';
      state.error =
        (action.payload as any)?.message ??
        action.error?.message ??
        'Unknown error';
    });
  }
})

// --- SELECTORS ---

const selectProductsObject = (state) => state.products.products;

export const selectAllProducts = createSelector(
  [selectProductsObject],
  (productsObject) => {
    return Object.values(productsObject)
  }
)

export const { clearSearch } = productsSlice.actions

export default productsSlice.reducer