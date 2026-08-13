import { authApi } from '@/entities/session';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { persistStorage } from '@/shared/lib';
import { createTransform, persistReducer } from 'redux-persist';
import { SessionUser, UserRole } from '@/entities/session/model/types';
import { purgeStoredState } from 'redux-persist';

export interface AuthState {
  user: SessionUser | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

// Strips the JWT before it reaches localStorage: the access token already
// lives in supabase-js's own session storage and useAuthSync restores it into
// memory on INITIAL_SESSION, so persisting it here too would just be a second
// XSS-exfiltratable copy with no functional benefit.
// Exported at module level (not re-exported through the slice's index.ts —
// it's an internal persistence detail, not part of the slice's public API)
// so authSlice.test.ts can verify it directly rather than only indirectly
// through persistStorage's serialized output.
export const stripAccessToken = createTransform<AuthState, AuthState>(
  (inboundState) => ({
    ...inboundState,
    token: null,
    user: inboundState.user ? { ...inboundState.user, accessToken: '' } : null,
  }),
  (outboundState) => outboundState,
  { whitelist: ['auth'] },
);

const authPersistConfig = {
  key: 'auth',
  storage: persistStorage,
  whitelist: ['user'],
  transforms: [stripAccessToken],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      purgeStoredState(authPersistConfig);
    },
    setSession(state, action: PayloadAction<{ user: SessionUser; token: string }>) {
      const incoming = action.payload.user;
      const isSameUser = state.user?.id === incoming.id;

      // useSessionSync dispatches twice per event: once immediately with empty
      // name fields so `isAuth` flips without a round-trip, then again once the
      // `profiles` row lands. This also fires on TOKEN_REFRESHED and re-auth
      // (e.g. the change-password flow), so without this merge the username
      // blanks out for one round-trip on every one of those events.
      state.user = isSameUser
        ? {
            ...state.user,
            ...incoming,
            firstName: incoming.firstName || state.user!.firstName,
            lastName: incoming.lastName || state.user!.lastName,
            username: incoming.username || state.user!.username,
            // `null` is the not-yet-resolved sentinel (not a falsy value like
            // '' above), so `??` rather than `||` — a genuine admin -> user
            // demotion still lands because the second dispatch always carries
            // a non-null role.
            role: incoming.role ?? state.user!.role,
          }
        : incoming;

      state.token = action.payload.token;
    },
    /** Resolves the role when the profiles fetch fails, so AdminRoute's
     * `role === null` loading branch cannot hang indefinitely. */
    setRole(state, action: PayloadAction<UserRole>) {
      if (state.user) state.user.role = action.payload;
    },
  },
  extraReducers: (builder) => {
    const handleFulfilled = (state: AuthState, { payload }: PayloadAction<SessionUser>) => {
      state.user = payload;
      state.token = payload.accessToken;
    };

    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, handleFulfilled)
      .addMatcher(authApi.endpoints.register.matchFulfilled, handleFulfilled)
      .addMatcher(authApi.endpoints.updateProfile.matchFulfilled, (state, { payload }) => {
        if (state.user) {
          state.user = { ...state.user, ...payload };
        }
      });
  },
});

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice.reducer);

export const { logout, setSession, setRole } = authSlice.actions;

export { persistedAuthReducer as authReducer };
export default persistedAuthReducer;
