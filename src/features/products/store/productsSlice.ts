import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit'
import { getProducts as fetchProducts, getProductById as fetchProductsById, searchProducts } from '../api'
import { createSelector } from 'reselect'
import { ProductStateType } from '@/types/productStateType'
import { params } from '../api/productsApi'

// Async request to get an array of products
export const getProducts = createAsyncThunk('products/getProducts',
  async (params: params, { rejectWithValue }) => {
    try {
      const response = await fetchProducts(params)
      if (response) {
        const { products } = response.data
        return products
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
  async (product:string, { rejectWithValue }) => {
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
// Async request to get an array of products by search
export const getProductsBySearch = createAsyncThunk('products/getProductsBySearch',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await searchProducts(query)
      if (response) {
        const { products } = response.data
        console.log(products);
        return products
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
    }
  },
  extraReducers: (builder) => {
    const thunks = [getProducts, getProductsById, getProductsBySearch];

    // builder for fullfiled separate for each of the thunks
    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.products = action.payload.reduce((accumulator, currentProduct) => {
        accumulator[currentProduct.id] = currentProduct
        return accumulator
      }, {})

    });

    builder.addCase(getProductsById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const newProduct = action.payload;

      state.products[newProduct.id] = newProduct
    });

    builder.addCase(getProductsBySearch.fulfilled, (state, action) => {
      state.searchStatus = 'succeeded';
      state.searchResults = action.payload
    })
    // penidng separate for getProductsBySearch

    builder.addCase(getProductsBySearch.pending, (state) => {
      state.error = null;
      state.searchStatus = 'loading';
    })
    // For pending, getProducts and getProductsById have a common method.
    builder.addMatcher(isPending(getProducts, getProductsById), (state) => {
      state.error = null;
      state.status = 'loading';
    })
    // rejected is common to everyone
    builder.addMatcher(isRejected, (state, action) => {
      state.status = 'failed';
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