import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Two projects, one config: "unit" (pure logic — money math, Redux, Zod,
// node env, *.test.ts) and "component" (rendering — RTL + jsdom, *.test.tsx).
// `extends: true` inherits resolve.alias/env/exclude from this root config.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Shared test helpers (renderWithProviders, fixtures, a Supabase stub)
      // live outside src/ — the FSD no-restricted-imports blocks in
      // eslint.config.ts glob src/<layer>/**/*.{ts,tsx}, which includes
      // colocated *.test.tsx, so a helper under src/shared/** couldn't
      // import makeStore from @/app/store.
      '@test': fileURLToPath(new URL('./test', import.meta.url)),
    },
  },
  test: {
    exclude: ['node_modules/**', 'e2e/**', '.next/**', '.next-second/**'],
    // Stubs so any module that reads Supabase env at import time (e.g.
    // shared/config/images.ts, which throws without NEXT_PUBLIC_SUPABASE_URL)
    // can't take the suite down — the CI check job carries no secrets. TZ is
    // pinned so formatDate (dateHelper.ts) is deterministic across machines —
    // a date-only string parses as UTC midnight, so an unpinned local TZ west
    // of UTC renders the previous day.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://stub.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'stub-anon-key',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      TZ: 'UTC',
    },
    // Declared once at root (not per-project) so `unit` and `component` both
    // report into one merged result rather than two separate ones. Scoped to
    // the surface this repo actually intends to cover — admin (src/entities/
    // admin, src/features/admin-*, src/views/admin-*, src/widgets/admin-*,
    // the AdminRoute guard, AdminLayout) is deliberately out of test scope,
    // same rationale as the E2E P0 table in AGENTS.md, so it's excluded from
    // the denominator rather than counted as an uncovered gap. Per-glob
    // `coverage.thresholds` (added once the logic-first sweep landed) gate
    // CI on this scoped surface — see AGENTS.md for the rationale on why
    // there's still no single repo-wide threshold.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/index.ts',
        '**/*.d.ts',
        'src/app/styles/**',
        '**/database.types.ts',
        // Admin panel — deliberately out of test scope (AGENTS.md).
        'src/entities/admin/**',
        'src/features/admin-*/**',
        'src/views/admin-*/**',
        'src/widgets/admin-*/**',
        'src/app/providers/AdminRoute/**',
        'src/app/layouts/AdminLayout/**',
        // Chart primitives only ever consumed by admin views (verified by
        // grep) — excluded alongside admin rather than left as a dead gap.
        'src/shared/ui/bar-chart/**',
        'src/shared/ui/line-chart/**',
        'src/shared/ui/donut-chart/**',
        'src/shared/ui/bar-list/**',
        'src/shared/ui/action-menu/**',
        // react-loading-skeleton wrappers — no branching to assert.
        'src/**/*Skeleton.tsx',
        // 'server-only' / 'use server' modules: unloadable outside a Next
        // build (vitest.setup.ts mocks revalidate.ts outright for this
        // reason — there is no way to exercise these under Vitest).
        'src/shared/api/supabase/server.ts',
        'src/shared/api/supabase/authz.ts',
        'src/shared/api/revalidate.ts',
        // Public-data server entry points — re-export barrels, same
        // category as the already-excluded **/index.ts.
        'src/**/server.ts',
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts', 'proxy.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
      },
    ],
  },
});
