import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Two projects, one config: "unit" (pure logic — money math, Redux, Zod,
// node env, *.test.ts) and "component" (rendering — RTL + jsdom, *.test.tsx).
// `extends: true` inherits resolve.alias/env/exclude from this root config.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
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
