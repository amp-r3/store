# AGENTS.md — Store Project (React 19 + TS + RTK + Supabase)

## Stack

React 19, TypeScript 5.9, Redux Toolkit 2.9 + RTK Query, redux-persist
(localStorage), React Router v7, Supabase (PostgreSQL+Auth), SCSS Modules + CSS
custom properties, React Hook Form + Zod, Vite 8 + LightningCSS.

## Structure

```
src/
├── app/ (store.ts, router.ts)
├── components/{common,cart,products,layout}/
├── hooks/{common,features/{cart,checkout,order,product,wishlist,auth}}/
├── pages/
├── schemas/        # Zod schemas, imported directly
├── services/       # RTK Query API slices, imported directly
├── store/          # slices + selectors
├── styles/
├── types/
└── utils/
```

New block = component + SCSS module + barrel export.

## CSS Naming — strict BEM

`block__element--modifier`. In TSX: only `style['block__element--modifier']`. Never raw string classNames.

## SCSS Rules

- One module per component, kebab-case, colocated:
  `Component/component-name.module.scss`.
- Tokens: `@use '@/styles/index' as *;` only — no `@import`.
- No magic values — use tokens (`$spacing-md`, `$radius-lg`, `$fs-base`,
  `$transition-base`, `$ease-out-expo`, etc).
- No hardcoded colors — use CSS custom properties:
  `--primary-accent[-rgb|-dark|-light]`,
  `--text-primary/secondary/muted/inverse`,
  `--background-body/component/glass-base/image-holder`,
  `--border-color[-subtle|-light|-strong]`,
  `--shadow-xs/sm/default/card/accent[-sm|-hover]`,
  `--glass-background[-subtle|-strong]`, `--glass-border`, `--error-color`,
  `--success-color`, `--rating-color`, `--skeleton-base/highlight`,
  `--focus-ring-color`, `--shadow-focus-input/button`. For rgba with accent:
  `rgba(var(--primary-accent-rgb), 0.08)`.
- Responsive: `@media` inline in module, no separate files. Breakpoints: 480,
  525, 549, 600, 640, 768, 1024, 1440px.
- `@keyframes` declared in module of use; timing via tokens only.
- All animations must include `@media (prefers-reduced-motion: reduce)`
  disabling transition/animation.

## Barrel Exports (index.ts)

Mandatory for every new component/hook/util at: `components/common`,
`components/cart`, `components/products`, `hooks`, `hooks/common`,
`hooks/features/*`, `store`, `utils`, `config`. NOT needed: `pages/` (lazy()
direct import in router.ts; exception `pages/index.ts` exports non-lazy
`CatalogPage`), page-internal subfolders, `services/`, `schemas/`.

## Components

- Structure:
  `ComponentName/{ComponentName.tsx, ComponentNameSkeleton.tsx, component-name.module.scss, components/}`.
- Mandatory `*Skeleton` (react-loading-skeleton) for any API-data component;
  colors via `baseColor="var(--skeleton-base)"` /
  `highlightColor="var(--skeleton-highlight)"`.
- List-rendered components: wrap in `React.memo`, set `displayName`.
- Portals (Drawer/Dialog/Dropdown) mount to
  `document.getElementById('modal-root')`.
- No HTML `<form>` in RTK-connected components; use onClick/onChange. Exception:
  native `<form onSubmit>` only in CheckoutPage/LoginPage/RegisterPage.

## Hooks

- All data-fetching/URL logic/computed state lives in hooks; components stay
  declarative.
- Feature hook structure:
  `hooks/features/cart/{useCartActions.ts (mutations), useCartDetails.ts (data), index.ts}`.
- Redux only via `useAppDispatch()` / `useAppSelector()`, never raw
  `useDispatch`/`useSelector`.

## State Management

- URL is source of truth for catalog UI: `?q=`, `?sortBy=`, `?order=`,
  `?category=`, `?page=` via `useSearchParams`. Never in Redux.
- redux-persist whitelist: `cart.items`, `theme.theme`, `auth.{user,token}`,
  `wishlist.favoriteItems`. RTK Query cache and transient UI state NOT
  persisted.
- Cart/wishlist mutations: optimistic updates via `onQueryStarted` +
  `updateQueryData`, rollback via `patchResult.undo()` on error.
- Derived state selectors: `createSelector` (Reselect) only.

## RTK Query / Services

- No direct `supabase.*` calls outside `services/`. All Supabase access via RTK
  Query `queryFn`.
- All API slices use `fakeBaseQuery()`.
- Normalize responses in `queryFn` (e.g. products →
  `{items: Record<id,Product>, ids: number[], total}`).
- Each slice declares `tagTypes`, uses `providesTags`/`invalidatesTags`.

## Typing

- `tsconfig`: `strict: true`, `noUnusedLocals: true`,
  `noUnusedParameters: true`. `any` only as last resort + comment.
- Shared interfaces in `src/types/`; local-only types stay in component file.
- All forms: Zod schemas (`src/schemas/`) + `react-hook-form` via
  `@hookform/resolvers/zod`.

## Routing

- All pages lazy via `lazy()` in router.ts, except `CatalogPage` (direct import,
  instant load).
- `ProtectedRoute`: `/user`, `/orders` → redirect `/login` if unauthenticated.
- `PublicRoute`: `/login`, `/register` → redirect `/` if authenticated.
- `CheckoutGuard`: requires auth + non-empty cart.

## Auth (Supabase)

- `useAuthSync` subscribes to `supabase.auth.onAuthStateChange`, syncs Redux
  store; called in `RootLayout` + `MainLayout`.
- `SIGNED_IN`: merge local cart/wishlist (localStorage) → server via
  `syncCart`/`syncWishlist`, then clear local.
- `SIGNED_OUT`: reset RTK Query cache (`cartApi`, `wishlistApi`),
  cart/wishlist/auth Redux slices.

## Theming

- Theme class (`theme-dark`/`theme-light`) on `document.documentElement`;
  components theme-agnostic.
- Only access via `useTheme()` → `{theme, toggleTheme, setTheme}`.
- No JS conditional styling by theme — use CSS custom properties. SCSS exception
  allowed: `:global(.theme-dark) .selector {}`.

## Performance

- Lazy-load all routes except `CatalogPage`.
- Images: first 8 cards `loading="eager" fetchPriority="high"`; rest
  `loading="lazy" decoding="async" fetchPriority="low"`.
- `useMemo` for expensive computation, `useCallback` for child callbacks,
  `React.memo` for list items, `createSelector` for Redux selectors.
- Optimistic updates mandatory for cart/wishlist mutations.

## Accessibility

- Semantic tags: `<article>` for cards/order rows; proper
  `<header>/<footer>/<nav>/<main>/<section>`; `.sr-only` for SR-only content.
- `aria-label` on icon-only buttons; `aria-live="polite"` for dynamic regions.
- Never remove `:focus-visible` without alternative indicator; use
  `--focus-ring-color`, `--shadow-focus-button`.
- Min touch target: `$touch-target-min` (44px), comfortable
  `$touch-target-comfortable` (48px).

## Haptics

`useHaptics()` from `web-haptics`: cart open/close → `soft()`; filter/sort
change → `light()`; nav link/card → `soft()`; form submit/confirm → `success()`.

## Status Badges

Use only `src/styles/_statuses.scss` mixins: `@include status.badge-base;` +
`@include status.generate-modifiers;`. Modifier via `data-status` or
`--${status}` class.

## Forbidden → Use Instead

- Hardcoded colors → CSS custom properties
- Hardcoded margins/sizes → SCSS tokens (`_variables.scss`)
- `any` → specific type or `unknown`
- Direct `supabase.*` in components → RTK Query `queryFn`
- `useDispatch()`/`useSelector()` → `useAppDispatch()`/`useAppSelector()`
- Catalog filters in Redux → URL via `useSearchParams`
- HTML `<form>` in pure components → `onSubmit` only in page components
- Non-barrel imports → via `index.ts`
- String CSS classes in JSX → `style['block__element--modifier']`
- Direct `localStorage` → `redux-persist` + `storage.ts`

## Git Commits

English only, Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`,
`style:`, `test:`, `chore:`). One logical change per commit; include dependent
cross-layer changes (API+components) in same commit to keep history functional
at every point. Message describes resulting change, no dev-process noise; body
only for large/complex changes. Review `git status`+diff before writing message;
if scope/impact unclear, stop and clarify.