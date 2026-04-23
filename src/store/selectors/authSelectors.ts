import { RootState } from "@/app/store"

export const selectUser = (state: RootState) => state.auth.user

export const selectToken = (state: RootState) => state.auth.token

export const selectIsAuth = (state: RootState) => !!state.auth.token

export const selectUserName = (state: RootState) => {
  const user = state.auth.user
  if (!user) return null
  return `${user.firstName} ${user.lastName}`
}