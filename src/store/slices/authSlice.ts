import { authApi } from "@/services/authApi";
import { createSlice } from "@reduxjs/toolkit";
import storage from "../storage";
import persistReducer from "redux-persist/es/persistReducer";

interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  image: string
}

export interface AuthState {
  user: User | null
  token: string | null
}

const initialState: AuthState = {
  user: null,
  token: null
}

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token']
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
    }
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.user = payload
        state.token = payload.accessToken
      }
    )
  }
});

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);

export const {logout} = authSlice.actions

export default persistedAuthReducer;
