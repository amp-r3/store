import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState

 } from "@/app/store";
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://dummyjson.com/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      if (token) headers.set('Authorization', `Bearer ${token}`)
        return headers
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({username, password}) => ({
        url: '/login',
        method: 'POST',
        body: { username, password, expiresInMins: 60 }
      })
    }),

    getMe: builder.query({
      query: () => '/me'
    }),

  })
})

export const { useLoginMutation, useGetMeQuery } = authApi