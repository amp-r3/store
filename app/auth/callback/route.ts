import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';

const CALLBACK_FAILED_DESCRIPTION =
  "We couldn't finish signing you in. If you opened a link from an email, open it in the browser you requested it from.";

function redirectToLoginWithError(origin: string, error: string, errorDescription?: string) {
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', error);
  if (errorDescription) loginUrl.searchParams.set('error_description', errorDescription);
  return NextResponse.redirect(loginUrl);
}

/** Where Supabase's OAuth redirectTo always points. Exchanges the `?code=`
 * for a session server-side (the PKCE code verifier lives in a cookie this
 * route reads), so the session cookie is already set by the time the
 * browser lands anywhere next — no client-side polling required.
 *
 * Supabase does not reliably preserve extra query params appended to
 * redirectTo through the provider round trip, so the post-login destination
 * can't travel that way — it's stashed in sessionStorage by useOAuthSignIn
 * before the redirect, same as it always was, and read back by the
 * /auth/callback/complete client page this redirects to. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    return redirectToLoginWithError(origin, error, errorDescription ?? undefined);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return redirectToLoginWithError(origin, 'callback_failed', CALLBACK_FAILED_DESCRIPTION);
    }

    return NextResponse.redirect(new URL('/auth/callback/complete', origin));
  }

  // No code and no error — shouldn't happen for this project's PKCE-only
  // flow (hash-fragment errors are an implicit-flow artifact, and the
  // fragment never reaches the server anyway). Fail safe rather than loop.
  return NextResponse.redirect(new URL('/login', origin));
}
