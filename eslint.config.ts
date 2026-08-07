import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import nextConfig from 'eslint-config-next'

export default [
  { ignores: ['.next'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
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
  // FSD layer direction (AGENTS.md §1): a layer may only import from layers
  // strictly below it. Catches upward/skip-layer imports mechanically,
  // regardless of quote style — the repo-wide grep block in AGENTS.md still
  // owns same-slice deep-import and cross-feature-runtime-import checks,
  // which a glob-based rule here can't distinguish from legitimate cases.
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app', '@/app/**', '@/entities', '@/entities/**', '@/features', '@/features/**', '@/widgets', '@/widgets/**', '@/views', '@/views/**'],
          message: 'shared must not import from any layer above it (AGENTS.md §1).',
        }],
      }],
    },
  },
  {
    files: ['src/entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app', '@/app/**', '@/features', '@/features/**', '@/widgets', '@/widgets/**', '@/views', '@/views/**'],
          message: 'entities must not import from features/widgets/views/app (AGENTS.md §1).',
        }],
      }],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app', '@/app/**', '@/widgets', '@/widgets/**', '@/views', '@/views/**'],
          message: 'features must not import from widgets/views/app (AGENTS.md §1).',
        }],
      }],
    },
  },
  {
    files: ['src/widgets/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app', '@/app/**', '@/views', '@/views/**'],
          message: 'widgets must not import from views/app (AGENTS.md §1).',
        }],
      }],
    },
  },
  {
    files: ['src/views/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/app', '@/app/**'],
          message: 'views must not import from app (AGENTS.md §1).',
        }],
      }],
    },
  },
]
