import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormData, RegisterFormData, SessionUser } from "@/types/auth";
import { supabase } from "@/supabase";
import { EditProfileSchema } from "@/schemas/editProfileSchema";


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({

    register: builder.mutation<SessionUser, RegisterFormData>({
      queryFn: async ({ firstName, lastName, username, email, password }) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName,
              lastName,
              username,
            },
          },
        });

        if (authError) {
          return { error: { status: 400, data: authError.message } };
        }

        const user = authData.user!;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          return {
            data: {
              id: user.id,
              email: user.email!,
              firstName: firstName,
              lastName: lastName,
              username: username,
              accessToken: authData.session?.access_token || '',
            },
          };
        }

        return {
          data: {
            id: user.id,
            email: user.email!,
            firstName: profile.first_name,
            lastName: profile.last_name,
            username: profile.username,
            accessToken: authData.session?.access_token || '',
          },
        };
      },
    }),

    login: builder.mutation<SessionUser, LoginFormData>({
      queryFn: async ({ email, password }) => {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email, password,
        });

        if (authError) {
          return { error: { status: 401, data: 'Incorrect email or password' } }
        }

        const user = authData.user;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          return { error: { status: 500, data: 'Error loading profile data' } }
        }

        return {
          data: {
            id: user.id,
            email: user.email!,
            accessToken: authData.session.access_token,
            firstName: profile.first_name,
            lastName: profile.last_name,
            username: profile.username,
          }
        }
      }
    }),

    updateProfile: builder.mutation<Partial<SessionUser>, EditProfileSchema>({
      queryFn: async (userData) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: userData.username 
          })
          .eq('id', user.id);

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