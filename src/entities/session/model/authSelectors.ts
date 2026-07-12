import { SharedRootState } from "@/shared/model/store-types"

export const selectUser = (state: SharedRootState) => state.auth.user

export const selectToken = (state: SharedRootState) => state.auth.token

export const selectIsAuth = (state: SharedRootState) => !!state.auth.token

export const selectUserName = (state: SharedRootState) => {
  const user = state.auth.user
  if (!user) return null
  return `${user.username}`
}