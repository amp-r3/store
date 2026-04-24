import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormData, RegisterFormData, SessionUser, StoredUser } from "@/types/auth";
import { supabase } from "@/supabase";
import { EditProfileSchema } from "@/schemas/editProfileSchema";


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({baseUrl: '/'}),
  endpoints: (builder) => ({

    register: builder.mutation<SessionUser, RegisterFormData>({
      queryFn: async ({ firstName, lastName, username, email, password }) => {
        
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              firstName: firstName,
              lastName: lastName,
              username: username,
            }
          }
        });

        if (error) {
          return { error: { status: 400, data: error.message } }
        }

        const user = data.user!;
        
        return {
          data: {
            id: user.id,
            firstName: user.user_metadata.firstName,
            lastName: user.user_metadata.lastName,
            username: user.user_metadata.username,
            email: user.email!,
            accessToken: data.session?.access_token || '',
          }
        }
      }
    }),
    
    login: builder.mutation<SessionUser, LoginFormData>({
      queryFn: async ({ email, password }) => {
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          return { error: { status: 401, data: 'Incorrect email or password' } }
        }

        const user = data.user;

        return {
          data: {
            id: user.id,
            firstName: user.user_metadata.firstName,
            lastName: user.user_metadata.lastName,
            username: user.user_metadata.username,
            email: user.email!,
            accessToken: data.session.access_token,
          }
        }
      }
    }),

    updateProfile: builder.mutation<Partial<SessionUser>, EditProfileSchema>({
      queryFn: async (userData) => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !user.email) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }


        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: userData.password,
        });


        if (signInError) {
          return { error: { status: 400, data: 'Incorrect current password' } };
        }

        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
          }
        });

        if (updateError) {
          return { error: { status: 400, data: updateError.message } };
        }

        const { password, ...restData } = userData;

        return { data: restData };
      }
    }),

  })
})

export const { useLoginMutation, useRegisterMutation, useUpdateProfileMutation } = authApi