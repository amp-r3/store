// `tsc --noEmit` typechecks the whole project and takes no file arguments —
// a function entry that discards its input and returns a bare command string
// is lint-staged's documented escape hatch. `incremental: true` +
// tsconfig.tsbuildinfo (gitignored) keeps it fast on a warm cache.
const typecheck = () => 'tsc --noEmit';

/** @type {import('lint-staged').Configuration} */
const config = {
  // Fixers first, Prettier last so it has the final word on formatting.
  // Safe ordering: the ESLint config has zero stylistic rules, so Prettier's
  // output can never reintroduce a lint error. `typecheck` runs sequentially
  // after the fixers (not concurrently) — it reads the same files ESLint's
  // --fix writes, and a concurrent read/write race would produce flaky
  // phantom syntax errors.
  '*.{ts,tsx}': ['eslint --fix --max-warnings=0 --no-warn-ignored', 'prettier --write', typecheck],
  '*.scss': ['stylelint --fix', 'prettier --write'],
  '*.{json,mjs,cjs,js}': ['prettier --write'],
  'README*.md': ['prettier --write'],
};

export default config;
