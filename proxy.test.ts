import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

// proxy.ts is the first line of auth defense (redirects unauthenticated
// visitors away from /user, /checkout, /admin before any page renders) and
// lives outside src/ (Next 16's rename of middleware.ts), so it has no
// coverage today. `createServerClient` is mocked rather than exercising the
// real @supabase/ssr client — this is a routing-decision test, not an
// integration test of Supabase's cookie-refresh internals.
let claimsResult: { data: { claims: unknown } | null } = { data: null };
// Simulates the real client calling the `cookies.setAll` option mid-request
// to persist a refreshed session token — proxy.ts's `copyCookies` exists
// specifically to carry that onto a redirect response, since
// NextResponse.redirect() is a brand-new response object.
let cookiesToSetOnRefresh: { name: string; value: string; options?: Record<string, unknown> }[] =
  [];

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(
    (
      _url: string,
      _key: string,
      config: { cookies: { setAll: (cookies: typeof cookiesToSetOnRefresh) => void } },
    ) => ({
      auth: {
        getClaims: async () => {
          if (cookiesToSetOnRefresh.length > 0) {
            config.cookies.setAll(cookiesToSetOnRefresh);
          }
          return claimsResult;
        },
      },
    }),
  ),
}));

beforeEach(() => {
  claimsResult = { data: null };
  cookiesToSetOnRefresh = [];
});

const authenticate = () => {
  claimsResult = { data: { claims: { sub: 'user-1' } } };
};

describe('proxy — protected prefixes', () => {
  it.each(['/user', '/checkout', '/admin'])(
    'redirects an unauthenticated visitor away from %s to /login with a ?from= round-trip',
    async (prefix) => {
      const request = new NextRequest(`http://localhost:3000${prefix}/orders?tab=1`);
      const response = await proxy(request);

      expect(response.status).toBe(307);
      const location = new URL(response.headers.get('location')!);
      expect(location.pathname).toBe('/login');
      expect(location.searchParams.get('from')).toBe(`${prefix}/orders?tab=1`);
    },
  );

  it('does not redirect an authenticated visitor from a protected prefix', async () => {
    authenticate();
    const request = new NextRequest('http://localhost:3000/checkout');
    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('does not treat a similarly-named path as protected (prefix boundary)', async () => {
    // isUnderAnyPrefix checks `pathname === prefix || pathname.startsWith(prefix + '/')` —
    // a naive `startsWith('/admin')` would wrongly also match this.
    const request = new NextRequest('http://localhost:3000/administrators');
    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects exactly at the bare prefix path too, not just its subpaths', async () => {
    const request = new NextRequest('http://localhost:3000/admin');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/login');
  });
});

describe('proxy — public-only paths', () => {
  it.each(['/login', '/register'])('lets an unauthenticated visitor reach %s', async (path) => {
    const request = new NextRequest(`http://localhost:3000${path}`);
    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('bounces an authenticated visitor away from /login to the safe ?from= target', async () => {
    authenticate();
    const request = new NextRequest('http://localhost:3000/login?from=%2Fuser%2Forders');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/user/orders');
  });

  it('falls back to / when the ?from= target is an open-redirect attempt', async () => {
    authenticate();
    const request = new NextRequest('http://localhost:3000/login?from=https://evil.com');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/');
  });

  it('falls back to / when there is no ?from= at all', async () => {
    authenticate();
    const request = new NextRequest('http://localhost:3000/register');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get('location')!).pathname).toBe('/');
  });
});

describe('proxy — unguarded paths', () => {
  it('passes an unauthenticated visitor through to a public page untouched', async () => {
    const request = new NextRequest('http://localhost:3000/catalog');
    const response = await proxy(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });
});

describe('proxy — copyCookies', () => {
  it('carries a refreshed session cookie onto a redirect response', async () => {
    cookiesToSetOnRefresh = [
      { name: 'sb-refresh-token', value: 'rotated-token', options: { path: '/' } },
    ];
    const request = new NextRequest('http://localhost:3000/checkout');
    const response = await proxy(request);

    expect(response.status).toBe(307);
    expect(response.cookies.get('sb-refresh-token')?.value).toBe('rotated-token');
  });
});
