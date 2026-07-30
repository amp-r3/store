import { useEffect } from "react";
import { supabase } from "@/shared/api/supabase";
import { useAppDispatch } from "@/shared/model";
import { setSession, setRecoverySession } from "@/entities/session";
import { AUTH_STORAGE_KEYS } from "@/shared/config";

/** Mirrors the Supabase auth session into Redux. Dispatches `setSession` twice
 * on sign-in: once immediately with an empty name/username so `isAuth`
 * flips right away (letting PublicRoute/ProtectedRoute react without waiting
 * on a network round-trip), then again once the `profiles` row has loaded.
 *
 * PublicRoute is the sole owner of the post-login redirect (it reacts to
 * `isAuth` becoming true and reads/clears the stored `from` itself) — this
 * hook only ever writes session state, never navigates. */
export const useSessionSync = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === 'SIGNED_IN') {
          // A successful sign-in means any provider previously blocked by a
          // failed OAuth attempt (see useAuthUrlError) is no longer blocked.
          sessionStorage.removeItem(AUTH_STORAGE_KEYS.blockedProviders);
        }

        if (event === 'PASSWORD_RECOVERY') {
          dispatch(setRecoverySession(true));
        }

        if (session?.user) {
          dispatch(setSession({
            user: {
              id: session.user.id,
              email: session.user.email!,
              accessToken: session.access_token,
              app_metadata: session.user.app_metadata,
              firstName: '',
              lastName: '',
              username: '',
            },
            token: session.access_token,
          }));

          const fetchProfile = async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (profileError) {
                console.error('Error fetching user profile:', profileError);
                return;
              }

              if (profile) {
                dispatch(setSession({
                  user: {
                    id: session.user.id,
                    email: session.user.email!,
                    accessToken: session.access_token,
                    app_metadata: session.user.app_metadata,
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || '',
                    username: profile.username || '',
                  },
                  token: session.access_token,
                }));
              }
            } catch (error) {
              console.error('Failed to load profile inside auth listener:', error);
            }
          };

          fetchProfile();
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);
};
