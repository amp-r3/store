import { AuthState } from "./authSlice"

export const selectUser = (state: { auth: AuthState }) => state.auth.user

export const selectToken = (state: { auth: AuthState }) => state.auth.token

export const selectIsAuth = (state: { auth: AuthState }) => !!state.auth.user

export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role ?? null

export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin'

export const selectUserName = (state: { auth: AuthState }) => {
  const user = state.auth.user
  if (!user) return null
  return `${user.username}`
}