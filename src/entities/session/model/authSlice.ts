import { authApi } from "@/entities/session";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import storage from "@/app/providers/store/storage";
import { persistReducer } from "redux-persist";
import { SessionUser } from "@/entities/session/model/types";
import { purgeStoredState } from "redux-persist";



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
      purgeStoredState(authPersistConfig);
    },
    setSession(state, action: PayloadAction<{ user: SessionUser, token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    }
  },
  extraReducers: (builder) => {
    const handleFulfilled = (state: AuthState, { payload }: PayloadAction<SessionUser>) => {
      state.user = payload
      state.token = payload.accessToken
    }

    builder
    .addMatcher(authApi.endpoints.login.matchFulfilled, handleFulfilled)
    .addMatcher(authApi.endpoints.register.matchFulfilled, handleFulfilled)
    .addMatcher(
      authApi.endpoints.updateProfile.matchFulfilled,
      (state, { payload }) => {
        if (state.user) {
          state.user = { ...state.user, ...payload };
        }
      }
    );
  }
});

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);

export const {logout, setSession} = authSlice.actions

export { persistedAuthReducer as authReducer };
export default persistedAuthReducer;
