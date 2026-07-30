import { ChangePasswordPayload, LoginFormData, RegisterFormData, RequestPasswordResetPayload, SessionUser, UpdatePasswordPayload, UpdateProfilePayload } from "@/entities/session/model/types";
import { supabase, baseApi } from "@/shared/api";
import type { Database } from "@/shared/api";
import type { OAuthResponse } from "@supabase/supabase-js";
import type { OAuthProviderId } from "@/shared/config";


export const authApi = baseApi.injectEndpoints({
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

        if (!authData.user) {
          return { error: { status: 500, data: 'Registration succeeded but no user was returned' } };
        }

        const user = authData.user;

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

    signInWithOAuth: builder.mutation<OAuthResponse['data'], OAuthProviderId>({
      queryFn: async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          return { error: { status: error.status || 500, data: error.message } };
        }

        return { data };
      }
    }),
    updateProfile: builder.mutation<Partial<SessionUser>, UpdateProfilePayload>({
      queryFn: async (userData) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        const profilePayload: Database['public']['Tables']['profiles']['Update'] = {};
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

    requestPasswordReset: builder.mutation<null, RequestPasswordResetPayload>({
      queryFn: async ({ email }) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // `next` is ours — GoTrue only ever *adds* `code` to redirect_to, it
          // never strips our query string, which keeps recovery detection
          // independent of whether this GoTrue version echoes `type=recovery`.
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`,
        });

        if (error) {
          return { error: { status: error.status ?? 500, data: error.message } };
        }

        // Deliberately identical for known and unknown addresses — see the
        // enumeration note in ForgotPasswordForm.
        return { data: null };
      }
    }),

    updatePassword: builder.mutation<null, UpdatePasswordPayload>({
      queryFn: async ({ password }) => {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          // "Auth session missing!" — the recovery link expired or was
          // already used to set a password once.
          if (/session missing/i.test(error.message)) {
            return { error: { status: 401, data: 'Your reset link has expired. Request a new one.' } };
          }
          return { error: { status: error.status ?? 400, data: error.message } };
        }

        // Fire-and-forget: invalidate this account's other sessions after a
        // password reset. A failure here must not fail the reset itself.
        void supabase.auth.signOut({ scope: 'others' });

        return { data: null };
      }
    }),

    changePassword: builder.mutation<null, ChangePasswordPayload>({
      queryFn: async ({ currentPassword, newPassword }) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
          return { error: { status: 401, data: 'The user is not authorized' } };
        }

        // Supabase has no "verify password" API. Re-signing in with the same
        // credentials is the only client-side proof of the current password;
        // on success it simply mints a fresh session for the same user, and
        // on failure the existing session is left untouched (supabase-js
        // only writes a session on success).
        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (reauthError) {
          if (reauthError.status === 429) {
            return { error: { status: 429, data: 'Too many attempts. Please wait a minute and try again.' } };
          }
          return { error: { status: 401, data: 'Current password is incorrect' } };
        }

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
          return { error: { status: error.status ?? 400, data: error.message } };
        }

        void supabase.auth.signOut({ scope: 'others' });

        return { data: null };
      }
    }),

    signOut: builder.mutation<null, void>({
      queryFn: async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
          return { error: { status: error.status || 500, data: error.message } };
        }

        return { data: null };
      }
    }),

    deleteAccount: builder.mutation<null, void>({
      queryFn: async () => {
        const { error } = await supabase.functions.invoke('delete-account');

        if (error) {
          return { error: { status: 500, data: error.message } };
        }

        /** Fire-and-forget: the account is already gone, so a failed local
         * sign-out shouldn't be reported as a failed deletion. */
        void supabase.auth.signOut();

        return { data: null };
      }
    }),

  })
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useSignInWithOAuthMutation,
  useUpdateProfileMutation,
  useRequestPasswordResetMutation,
  useUpdatePasswordMutation,
  useChangePasswordMutation,
  useSignOutMutation,
  useDeleteAccountMutation,
} = authApi