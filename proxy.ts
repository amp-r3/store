import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { safeRedirectPath } from '@/shared/lib/safeRedirectPath';

const PROTECTED_PREFIXES = ['/user', '/checkout', '/admin'];
const PUBLIC_ONLY_PATHS = ['/login', '/register'];

function isUnderAnyPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function proxy(request: NextRequest) {
  // Mutable response the Supabase client's setAll rewrites into as it
  // refreshes cookies — start from a pass-through so unmatched cases still
  // carry the (possibly refreshed) request through untouched.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  // Calling this is what actually triggers the refresh and the setAll
  // above — do not remove even though the result is only used for its
  // presence/absence below. `data` (not just `data.claims`) is null when
  // there's no session at all, so check it before touching `.claims`.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = !!data?.claims;

  const { pathname, search } = request.nextUrl;

  if (isUnderAnyPrefix(pathname, PROTECTED_PREFIXES) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (PUBLIC_ONLY_PATHS.includes(pathname) && isAuthenticated) {
    const from = safeRedirectPath(request.nextUrl.searchParams.get('from'));
    return NextResponse.redirect(new URL(from, request.url));
  }

  return response;
}

export const config = {
  // Skip Next's own asset routes and anything under public/ (any path whose
  // last segment has a file extension — favicon.ico, sitemap.xml,
  // robots.txt, images, the webmanifest, etc.) rather than listing each one.
  matcher: [
    '/((?!_next/static|_next/image|.*\\..*).*)',
  ],
};
