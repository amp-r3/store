# AGENTS.md — Store Project (React 19 + TS + RTK + Supabase + FSD)

## Stack

React 19, TypeScript 5.9, Redux Toolkit 2.9 + RTK Query, redux-persist
(localStorage), React Router v7, Supabase (PostgreSQL+Auth), SCSS Modules + CSS
custom properties, React Hook Form + Zod, Vite 8 + LightningCSS.

## Architecture — Feature-Sliced Design (FSD)

The project strictly follows the [Feature-Sliced Design](https://feature-sliced.design/) methodology.
The codebase is divided into architectural layers (from highest to lowest):

```text
src/
├── app/        # Initialization, routing, store setup, global styles
├── pages/      # Page components (composition of widgets/features/entities)
├── widgets/    # Complex standalone components (Header, ProductList, CartDrawer)
├── features/   # User interactions & use-cases (AddToCart, AuthForm, ThemeToggle)
├── entities/   # Business entities (User, Product, Cart, Order)
└── shared/     # Reusable logic, UI kit, configs, API base, utils
```

### FSD Principles & Scenarios

1. **Unidirectional Dependency Rule**: A layer can only import from layers strictly below it. 
   - `pages` can import from `widgets`, `features`, `entities`, `shared`.
   - `features` can import from `entities`, `shared`.
   - Never import upwards.
2. **Slices**: Inside `pages`, `widgets`, `features`, and `entities`, code is grouped into slices by business domain (e.g., `entities/product`, `features/cart`). Cross-imports between slices on the same layer are strictly forbidden. If `feature A` needs `feature B`, orchestrate them at the `widgets` or `pages` layer, or extract common logic to `entities`/`shared`.
3. **Segments**: Inside a slice, code is structured by technical purpose: `ui/` (components), `model/` (state, slice, selectors), `api/` (RTK Query endpoints, API calls), `lib/` (utils, hooks).
4. **Public API (index.ts)**: Every slice MUST have an `index.ts` file at its root. This file acts as the public API. Other slices/layers must only import through this `index.ts`. Internal slice files must not be accessed directly from the outside.

## CSS Naming — strict BEM

`block__element--modifier`. In TSX: only `style['block__element--modifier']`. Never raw string classNames.

## SCSS Rules

- One module per component, kebab-case, colocated in `ui/`: `Component/component-name.module.scss`.
- Tokens: `@use '@/shared/styles/index' as *;` only — no `@import`.
- No magic values — use tokens (`$spacing-md`, `$radius-lg`, `$fs-base`, `$transition-base`, `$ease-out-expo`, etc).
- No hardcoded colors — use CSS custom properties: `--primary-accent`, `--text-primary`, `--background-body`, `--glass-background`, `--skeleton-base`, etc.
- Responsive: `@media` inline in module, no separate files. Breakpoints: 480, 525, 549, 600, 640, 768, 1024, 1440px.
- `@keyframes` declared in module of use; timing via tokens only.
- All animations must include `@media (prefers-reduced-motion: reduce)`.

## Components & UI

- Structure inside a slice segment: `ui/ComponentName/{ComponentName.tsx, ComponentNameSkeleton.tsx, component-name.module.scss}`.
- Shared generic components (buttons, skeletons) are placed in `shared/ui`.
- Mandatory `*Skeleton` (react-loading-skeleton) for any API-data component; colors via `baseColor="var(--skeleton-base)"` / `highlightColor="var(--skeleton-highlight)"`.
- List-rendered components: wrap in `React.memo`, set `displayName`.
- Portals (Drawer/Dialog/Dropdown) mount to `document.getElementById('modal-root')`.

## State Management & RTK Query

- URL is the source of truth for catalog UI (`?q=`, `?sortBy=`, `?category=`). Never in Redux.
- Redux slices and selectors live in the `model` segment of their respective slice (e.g., `entities/cart/model/slice.ts`).
- API slices/endpoints live in the `api` segment (e.g., `features/auth/api/authApi.ts`). They inject endpoints into a base API defined in `shared/api`.
- redux-persist whitelist: `cart.items`, `theme.theme`, `auth.{user,token}`, `wishlist.favoriteItems`. RTK Query cache and transient UI state NOT persisted.
- Optimistic updates via `onQueryStarted` + `updateQueryData`, rollback via `patchResult.undo()` on error.
- Derived state selectors: `createSelector` (Reselect) only.

## Typing

- `tsconfig`: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`. `any` only as last resort + comment.
- Shared interfaces in `shared/types/`; local-only types stay in the component/model file.
- All forms: Zod schemas + `react-hook-form` via `@hookform/resolvers/zod`.

## Routing

- Routes configuration is in `app/providers/RouterProvider` (or `app/router.tsx`).
- All pages lazy via `lazy()`, except `CatalogPage` (direct import, instant load).
- Guards (`ProtectedRoute`, `PublicRoute`, `CheckoutGuard`) are used to protect routes.

## Auth (Supabase)

- `useAuthSync` subscribes to `supabase.auth.onAuthStateChange`, syncs Redux store.
- `SIGNED_IN`: merge local cart/wishlist (localStorage) → server, then clear local.
- `SIGNED_OUT`: reset RTK Query cache, cart/wishlist/auth Redux slices.
- Supabase access outside `api/` segments is forbidden.

## Performance

- Lazy-load all routes except `CatalogPage`.
- Images: first 8 cards `loading="eager" fetchPriority="high"`; rest `loading="lazy" decoding="async" fetchPriority="low"`.
- `useMemo` for expensive computation, `useCallback` for child callbacks, `React.memo` for list items.

## Accessibility

- Semantic tags: `<article>` for cards/order rows; proper `<header>/<footer>/<nav>/<main>/<section>`; `.sr-only` for SR-only content.
- `aria-label` on icon-only buttons; `aria-live="polite"` for dynamic regions.
- Never remove `:focus-visible` without alternative indicator; use `--focus-ring-color`, `--shadow-focus-button`.
- Min touch target: `$touch-target-min` (44px), comfortable `$touch-target-comfortable` (48px).

## Haptics

`useHaptics()` from `web-haptics`: cart open/close → `soft()`; filter/sort change → `light()`; nav link/card → `soft()`; form submit/confirm → `success()`.

## Status Badges

Use only `shared/styles/_statuses.scss` mixins. Modifier via `data-status` or `--${status}` class.

## Forbidden → Use Instead

- Cross-slice imports on the same layer → Compose at a higher layer (`widgets`/`pages`) or extract to a lower layer (`entities`/`shared`)
- Importing bypassing `index.ts` → Import only from the slice's public API (`index.ts`)
- Importing upwards → Respect unidirectional data flow
- Hardcoded colors → CSS custom properties
- Hardcoded margins/sizes → SCSS tokens
- `any` → specific type or `unknown`
- Direct `supabase.*` in components → RTK Query endpoints inside `api/` segment
- `useDispatch()`/`useSelector()` → `useAppDispatch()`/`useAppSelector()`
- Catalog filters in Redux → URL via `useSearchParams`

## Git Commits

English only, Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`). One logical change per commit; include dependent cross-layer changes (API+components) in same commit to keep history functional at every point. Message describes resulting change, no dev-process noise; body only for large/complex changes. Review `git status`+diff before writing message.