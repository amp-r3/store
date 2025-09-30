import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchProducts } from '../../api/productsApi'


export const getProducts = createAsyncThunk('products/getProducts',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await fetchProducts(limit)
      if (response) {
        const {products} = response.data
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
const initialState = {
  products: null,
  status: null,
  error: null
}

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getProducts.pending, (state) => {
      state.error = null;
      state.status = 'loading'
    })
    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.products = action.payload;
      state.status = 'succeeded'
    })
    builder.addCase(getProducts.rejected, (state, action) => {
      state.error = action.payload.message;
      state.status = 'failed'
    })
  }
})

export default productsSlice.reducer