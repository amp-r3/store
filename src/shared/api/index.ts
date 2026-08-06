// The server-only client (./supabase/server) is deliberately NOT re-exported
// here: it imports next/headers and 'server-only', which would break every
// client component that imports anything else from this barrel. Server
// consumers (proxy.ts, app/admin/layout.tsx, route handlers) import
// '@/shared/api/supabase/server' directly.
export * from './supabase/client';
export * from './baseApi';
export * from './tags';
export type { Database } from './database.types';
