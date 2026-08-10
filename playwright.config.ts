import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';

// See e2e/support/env.ts for the env vars this config and the specs need
// (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, E2E_USER_*).
// This suite runs against the real Supabase project (AGENTS.md: no local
// stack has seed data) — see e2e/global.teardown.ts for cleanup.

const PORT = 3000;
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const STORAGE_STATE = 'e2e/.auth/user.json';

const reporter: ReporterDescription[] = [['list'], ['html', { open: 'never' }]];
if (process.env.CI) reporter.push(['github']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Every component here ships a `prefers-reduced-motion: reduce` branch
    // (AGENTS.md's a11y rule) that strips its CSS transitions/transforms —
    // the add-to-cart button's hover-lift, MobileBar's layer cross-fade,
    // the qty-pop bounce, etc. A transform still mid-transition when
    // Playwright hovers/clicks keeps the element's bounding box from
    // settling, which its actionability check reads as "not stable" and
    // retries until `actionTimeout` — indistinguishable from a hang.
    // Requesting reduced motion here removes that whole class of flake
    // instead of chasing it one selector at a time. `reducedMotion` isn't a
    // top-level `use` key in this Playwright version — it's a
    // `browser.newContext()` option, routed through `contextOptions`.
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'auth.setup.ts',
    },
    {
      name: 'cleanup',
      testMatch: 'global.teardown.ts',
    },
    {
      name: 'chromium-guest',
      use: { ...devices['Desktop Chrome'], storageState: undefined },
      testMatch: ['catalog.spec.ts', 'cart.spec.ts', 'auth.spec.ts'],
      // auth.spec.ts logs in with the shared E2E_USER_* credentials, so it
      // needs `setup` to have created that user first — `storageState` is
      // still explicitly undefined above, `dependencies` only orders runs.
      dependencies: ['setup'],
    },
    {
      name: 'chromium-auth',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      testMatch: ['checkout.spec.ts'],
      dependencies: ['setup'],
      teardown: 'cleanup',
    },
    {
      name: 'mobile-guest',
      use: { ...devices['Pixel 7'], storageState: undefined },
      testMatch: ['catalog.spec.ts', 'cart.spec.ts'],
    },
  ],
  webServer: {
    command: 'pnpm start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
