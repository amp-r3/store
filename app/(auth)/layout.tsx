import { PublicRoute } from '@/app/providers/PublicRoute/PublicRoute';

// Inherently per-visitor (redirects an already-authenticated user away) —
// force dynamic rendering rather than auditing every useSearchParams() call
// reachable from here (useAuthUrlError, useOAuthSignIn, ...) for a Suspense
// boundary. Static generation has no upside for a login/register page anyway.
export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
