import { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "@/shared/api/supabase";
import { useAppDispatch } from "@/shared/model";
import { setSession } from "@/entities/session";
import { safeRedirectPath } from "@/shared/lib";

/** Mirrors the Supabase auth session into Redux. Dispatches `setSession` twice
 * on sign-in: once immediately with an empty name/username so `isAuth`
 * flips right away (letting PublicRoute/ProtectedRoute react without waiting
 * on a network round-trip), then again once the `profiles` row has loaded. */
export const useSessionSync = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (event === 'SIGNED_IN') {
          const storedFrom = sessionStorage.getItem('auth_redirect_from');
          if (storedFrom) {
            sessionStorage.removeItem('auth_redirect_from');
            navigate(safeRedirectPath(storedFrom), { replace: true });
          }
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
  }, [dispatch, navigate]);
};
