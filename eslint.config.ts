import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import nextConfig from 'eslint-config-next'

export default [
  { ignores: ['dist', '.next'] },
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
]
