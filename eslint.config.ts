import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nextConfig from 'eslint-config-next';
import unusedImports from 'eslint-plugin-unused-imports';

const config = [
  {
    ignores: [
      '.next',
      '.next-second',
      'out',
      'next-env.d.ts',
      'public',
      'playwright-report',
      'test-results',
      'blob-report',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'unused-imports': unusedImports },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // superseded by unused-imports/no-unused-vars
      'unused-imports/no-unused-imports': 'error', // autofixable
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],
      'react-hooks/exhaustive-deps': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/no-danger': 'error',
      // eslint-config-next pulls in eslint-plugin-react-hooks v7, whose
      // recommended set adds React Compiler-readiness rules (this project
      // doesn't run the compiler). They flag ~60 pre-existing, functionally
      // correct patterns (e.g. MobileBar's "keep last known value while
      // transitioning" ref) that predate this ruleset. Rewriting them is
      // separate cleanup work, not part of the Next.js migration — tracked,
      // not silently fixed or hidden.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
  // supabase/functions/** is Deno, not Node/browser: `Deno.*` globals, remote
  // `https://` imports, its own deno.json. Excluded from tsconfig.json and
  // typechecked by the Deno LSP (.vscode/settings.json), so the browser-facing
  // rules above don't apply. `globals` ships no `deno` set — declare it here.
  {
    files: ['supabase/functions/**/*.ts'],
    languageOptions: { globals: { Deno: 'readonly' } },
    rules: { 'no-console': 'off' },
  },
  // e2e/** is Playwright test code, not React — eslint-config-next's
  // react-hooks/rules-of-hooks misfires on fixture factories' `use(...)`
  // callback parameter (its name coincidentally matches the "custom hook"
  // naming convention the rule looks for), flagging plain async functions
  // that aren't hooks at all.
  {
    files: ['e2e/**/*.ts', 'playwright.config.ts'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  // FSD layer direction (AGENTS.md §1): a layer may only import from layers
  // strictly below it. Catches upward/skip-layer imports mechanically,
  // regardless of quote style — the repo-wide grep block in AGENTS.md still
  // owns same-slice deep-import and cross-feature-runtime-import checks,
  // which a glob-based rule here can't distinguish from legitimate cases.
  //
  // Each block below sets `no-restricted-imports` wholesale (flat config
  // replaces a rule's value, it does not merge options) — a new pattern must
  // be added to all five, or a sixth block added for app/**, never hoisted
  // into a single repo-wide rule (it would be dead here or disable these).
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app',
                '@/app/**',
                '@/entities',
                '@/entities/**',
                '@/features',
                '@/features/**',
                '@/widgets',
                '@/widgets/**',
                '@/views',
                '@/views/**',
              ],
              message: 'shared must not import from any layer above it (AGENTS.md §1).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/app',
                '@/app/**',
                '@/features',
                '@/features/**',
                '@/widgets',
                '@/widgets/**',
                '@/views',
                '@/views/**',
              ],
              message: 'entities must not import from features/widgets/views/app (AGENTS.md §1).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/**', '@/widgets', '@/widgets/**', '@/views', '@/views/**'],
              message: 'features must not import from widgets/views/app (AGENTS.md §1).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/**', '@/views', '@/views/**'],
              message: 'widgets must not import from views/app (AGENTS.md §1).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/views/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/**'],
              message: 'views must not import from app (AGENTS.md §1).',
            },
          ],
        },
      ],
    },
  },
];

export default config;
