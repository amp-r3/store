import { useEffect } from "react";
import { useNavigate } from "react-router";

/** Supabase reports OAuth failures via `?error=`/`#error=` on whatever page it
 * redirects back to. If that isn't already /login or /register, send the user
 * there so the error can be surfaced by useAuthUrlError. */
export const useOAuthErrorRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorFromSearch = searchParams.get('error');

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const errorFromHash = hashParams.get('error');

    if ((errorFromSearch || errorFromHash) && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      navigate('/login' + window.location.search + window.location.hash, { replace: true });
    }
  }, [navigate]);
};
