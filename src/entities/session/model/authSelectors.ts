import { AuthState } from "./authSlice"

export const selectUser = (state: { auth: AuthState }) => state.auth.user

export const selectToken = (state: { auth: AuthState }) => state.auth.token

export const selectIsAuth = (state: { auth: AuthState }) => !!state.auth.token

export const selectUserName = (state: { auth: AuthState }) => {
  const user = state.auth.user
  if (!user) return null
  return `${user.username}`
}