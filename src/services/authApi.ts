import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormData, RegisterFormData, SessionUser, StoredUser } from "@/types/auth";


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({baseUrl: '/'}),
  endpoints: (builder) => ({

    register: builder.mutation<SessionUser, RegisterFormData>({
      queryFn: ({ firstName, lastName, username, email, password}) => {
        const users: StoredUser[] = JSON.parse(
          localStorage.getItem('users') || '[]'
        )
        if (users.find(u => u.email === email) || users.find(u => u.username === username)) {
          if (users.find(u => u.username === username)) {
            return { error: { status: 409, data: 'Username is already taken' } }
          }
          return { error: { status: 409, data: 'Email is already taken' } }
        }

        const newUser: StoredUser = {
          id: crypto.randomUUID(),
          username,
          firstName,
          lastName,
          email,
          password
        }

        localStorage.setItem('users', JSON.stringify([...users, newUser]))

        return {
          data: {
            id: newUser.id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            username: newUser.username,
            email: newUser.email,
            accessToken: crypto.randomUUID(),
          }
        }
      }
    }),
    
    login: builder.mutation<SessionUser, LoginFormData>({
      queryFn: ({email, username, password}) => {
        const users: StoredUser[] = JSON.parse(
          localStorage.getItem('users') || '[]'
        )

        const user = users.find(
          u => u.email === email && u.username === username && u.password === password
        )

        if (!user) {
          return { error: { status: 401, data: 'Invalid data' } }
        }

        return {
          data: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            accessToken: crypto.randomUUID(),
          }
        }
      }
    })

  })
})

export const { useLoginMutation, useRegisterMutation } = authApi