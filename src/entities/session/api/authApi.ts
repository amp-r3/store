import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginFormData, RegisterFormData, SessionUser } from "@/entities/session/model/types";
import { supabase } from "@/shared/api";
import { EditProfileSchema } from "@/features/profile-edit";


export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({

    register: builder.mutation<SessionUser, RegisterFormData>({
      queryFn: async ({ email, password }) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
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
              firstName: '',
              lastName: '',
              username: '',
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

    signInWithGoogle: builder.mutation<any, void>({
      queryFn: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/login`
          }
        });

        if (error) {
          return { error: { status: error.status || 500, data: error.message } as any };
        }

        return { data } as any;
      }
    }),
    signInWithTelegram: builder.mutation<any, void>({
      queryFn: async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'custom:telegram',
          options: {
            redirectTo: `${window.location.origin}/login`
          }
        });

        if (error) {
          return { error: { status: error.status || 500, data: error.message } as any };
        }

        return { data } as any;
      }
    }),
    updateProfile: builder.mutation<Partial<SessionUser>, EditProfileSchema>({
      queryFn: async (userData) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const profilePayload: Record<string, any> = {};
        if (userData.firstName !== undefined) profilePayload.first_name = userData.firstName;
        if (userData.lastName !== undefined) profilePayload.last_name = userData.lastName;
        if (userData.username !== undefined) profilePayload.username = userData.username;

        let updatedProfile = null;

        if (Object.keys(profilePayload).length > 0) {
          const { data: profileData, error: updateError } = await supabase
            .from('profiles')
            .update(profilePayload)
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) {
            return { error: { status: 400, data: updateError.message } };
          }
          updatedProfile = profileData;
        }

        let updatedEmail = user.email;
        if (userData.email && userData.email !== user.email) {
          const { error: authError } = await supabase.auth.updateUser({ email: userData.email });

          if (authError) {
            return { error: { status: 400, data: authError.message } };
          }
          updatedEmail = userData.email;
        }

        return {
          data: {
            ...(updatedProfile && {
              firstName: updatedProfile.first_name,
              lastName: updatedProfile.last_name,
              username: updatedProfile.username,
            }),
            email: updatedEmail
          }
        };
      }
    }),

  })
})

export const { useLoginMutation, useRegisterMutation, useSignInWithGoogleMutation, useSignInWithTelegramMutation, useUpdateProfileMutation } = authApi