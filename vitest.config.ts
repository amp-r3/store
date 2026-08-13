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
    // can't take the suite down — the CI check job carries no secrets.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://stub.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'stub-anon-key',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    },
    // Declared once at root (not per-project) so `unit` and `component` both
    // report into one merged result rather than two separate ones.
    // Deliberately no `thresholds` — most of src/ (admin, views, widgets)
    // has no test coverage yet by design (AGENTS.md's E2E section explains
    // what's out of scope), so a repo-wide gate would fail immediately and
    // just get disabled. `pnpm test:unit:coverage` is report-only until a
    // later pass adds narrow per-glob thresholds on the directories that
    // actually have tests.
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
      ],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
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
