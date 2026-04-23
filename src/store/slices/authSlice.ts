import { authApi } from "@/services/authApi";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import storage from "../storage";
import persistReducer from "redux-persist/es/persistReducer";
import { SessionUser, StoredUser } from "@/types/auth";



export interface AuthState {
  user: SessionUser | null
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
    const handleFulfilled = (state, { payload }: PayloadAction<SessionUser>) => {
      state.user = payload
      state.token = payload.accessToken
    }

    builder
    .addMatcher(authApi.endpoints.login.matchFulfilled, handleFulfilled)
    .addMatcher(authApi.endpoints.register.matchFulfilled, handleFulfilled)
  }
});

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);

export const {logout} = authSlice.actions

export default persistedAuthReducer;
