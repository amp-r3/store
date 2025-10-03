import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit'
import { fetchProducts, fetchProductsById } from '../../api/productsApi'


export const getProducts = createAsyncThunk('products/getProducts',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await fetchProducts(limit)
      if (response) {
        const { products } = response.data
        console.log(products);
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

export const getProductsById = createAsyncThunk('products/getProductsById',
  async (product, { rejectWithValue }) => {
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

const initialState = {
  products: [],
  status: 'idle',
  error: null
}

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const thunks = [getProducts, getProductsById];

    // builder для fullfiled отдельный для каждого из thunk'ов
    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.products = action.payload
    });

    builder.addCase(getProductsById.fulfilled, (state, action) => {
      state.status = 'succeeded';
      const newProduct = action.payload;

      const existingProduct = state.products.find(p => p.id === newProduct.id);

      if (!existingProduct) {
        state.products.push(newProduct)
      }
    });
    // А для pending и rejected общий

    builder.addMatcher(isPending(...thunks), (state) => {
      state.error = null;
      state.status = 'loading';
    });

    builder.addMatcher(isRejected(...thunks), (state, action) => {
      state.error = action.payload.message;
      state.status = 'failed';
    });


  }
})

export default productsSlice.reducer