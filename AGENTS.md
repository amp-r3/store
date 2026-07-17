# CLAUDE.md

Guidance for Claude Code in this repo. `CLAUDE.md` symlinks `AGENTS.md` — edit `AGENTS.md`.

## Stack

React 19, TypeScript 5.9, Redux Toolkit 2.9 + RTK Query, redux-persist
(localStorage), React Router v7, Supabase (PostgreSQL+Auth), SCSS Modules + CSS
custom properties, React Hook Form + Zod, Vite 8 + LightningCSS.

## Commands

- `pnpm dev` — Vite dev server (`http://localhost:5173`). `pnpm preview` — serve
  build. `pnpm build` — `tsc -b` then production build. `pnpm tsc` — type-check
  only. `pnpm lint` — ESLint (`eslint.config.ts`).
- **No test runner** (no Vitest/Jest, no `test` script) — don't assume test infra
  exists; verify via `pnpm tsc`, `pnpm lint`, and manual exercise of the flow.
- Needs `.env` with `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for auth, cart, wishlist, orders.

## Entry Points & Data Flow

- `src/main.tsx` → `src/app/store.ts` (Redux + persist) + `src/app/router.ts` →
  `src/app/layouts/` (`RootLayout`/`MainLayout`/`AuthLayout`) wrapping guards in
  `app/providers/` (`ProtectedRoute`, `PublicRoute`, `CheckoutGuard`).
- All server data (catalog, auth, cart, wishlist, orders) comes from Supabase,
  **only** via RTK Query endpoints injected into the base API in `shared/api`
  (built on `shared/api/supabase.ts`). No external product API.

## Architecture — Feature-Sliced Design (FSD)

Strictly [FSD](https://feature-sliced.design/). Layers under `src/`, highest →
lowest: `app/` (init, routing, store, global styles) · `pages/` (composition of
widgets/features/entities) · `widgets/` (complex standalone components — Header,
ProductList, CartDrawer) · `features/` (user interactions — AddToCart, AuthForm,
ThemeToggle) · `entities/` (business entities — User, Product, Cart, Order) ·
`shared/` (reusable logic, UI kit, configs, API base, utils).

### 1. Unidirectional dependencies

A layer imports only from layers strictly below:
`pages → widgets → features → entities → shared`. `shared` never imports from
any layer above it — not even a type; `entities` never from
`features`/`widgets`/`pages`; `features` never from `widgets`/`pages`. If a
lower layer "needs" a type from a higher one (e.g. `CreateOrderPayload` in
`entities/order/api`), **move the type down**, never the import up. Two slices
importing each other in opposite directions (even indirectly) = circular
dependency = something is misplaced, usually one layer too high.

### 2. Same-layer cross-imports

Runtime cross-imports between **feature** slices (components, hooks, actions,
selectors) are forbidden — compose at `widgets`/`pages` instead. **Exception:**
explicit `import type` between features, when a type belongs to one feature's
domain and another must reference it; write `import type` literally so the
exception stays greppable. First ask whether the type is really a
business-entity concept (order status, product size) — then it belongs in
`entities`, not behind this exception.

```ts
import type { CheckoutStep } from '@/features/checkout-process';   // ✅
import { useCheckoutTotals } from '@/features/checkout-process';   // ❌ runtime
```

Entity↔entity cross-imports that aren't read-only, one-directional and via
public API: don't add without flagging for review.

### 3. Segments

Inside a slice: `ui/` (components), `model/` (state, slice, selectors, types),
`api/` (RTK Query endpoints), `lib/` (utils, hooks), `config/` (static config on
the slice's own domain types).

### 4. Public API (`index.ts`) — never bypass

Every slice MUST have a root `index.ts`; other slices import only through it.
Most-violated rule — a hard constraint on every import you write or touch.
Importing your **own** slice's internals via absolute alias is a style choice,
not a violation — don't "fix" it unless asked. When you add a
component/hook/type another slice needs, export it from that slice's `index.ts`
**in the same task**.

```ts
import { X } from '../../../widgets/product-gallery/ProductGallery'; // ❌ relative, crosses slice
import { OrderCard } from '@/entities/order/ui/order-card/OrderCard'; // ❌ past index.ts
import { OrderCard } from '@/entities/order';                         // ✅ public API
```

### 5. pages vs widgets

A block in `pages/<page>/ui/components/` moves to `widgets/` only if **both**
hold: (1) it imports from **two or more** `entities`/`features` slices (real
domain composition, not one entity for props typing), **and** (2) it's plausibly
reusable outside this page (modal, quick-view, another page) even if unused
today. `dispatch(...)`, RTK Query hooks or `useNavigate` alone is **not** a
reason to move — it only strengthens a case where (1) already holds. If (1)
holds but the block is glued to this page's layout/copy, leave it and say so in
your summary. When in doubt, leave it in place.

### Self-check before finishing any task

Grep repo-wide — not just the file you were pointed at. Expect zero results
(same-slice self-imports excluded):

```bash
grep -rn "from '@/features" src/entities/
grep -rn "from '@/widgets\|from '@/pages'" src/features/
grep -rn "from '@/entities\|from '@/features\|from '@/widgets\|from '@/pages'" src/shared/
grep -rEn "from '(\.\./)+(entities|features|widgets|pages)" src/
grep -rEn "from '@/(entities|features|widgets|pages)/[a-zA-Z0-9_-]+/(model|ui|api|lib|config)" src/
```

## Forbidden → Use Instead

- Hardcoded colors → CSS custom properties. Hardcoded margins/sizes → SCSS tokens.
- `any` → specific type or `unknown`. Raw string classNames → `style['...']`.
- Direct `supabase.*` in components → RTK Query endpoints in an `api/` segment.
- `useDispatch()`/`useSelector()` → `useAppDispatch()`/`useAppSelector()`.
- Catalog filters in Redux → URL via `useSearchParams`.

## CSS / SCSS

- Strict BEM: `block__element--modifier`; in TSX only
  `style['block__element--modifier']`, never raw strings.
- One module per component, kebab-case, colocated:
  `Component/component-name.module.scss`.
- Tokens via `@use '@/app/styles/index' as *;` only — never `@import`.
- No magic values — use tokens (`$spacing-md`, `$radius-lg`, `$fs-base`,
  `$transition-base`, `$ease-out-expo`…). No hardcoded colors — use CSS custom
  properties (`--primary-accent`, `--text-primary`, `--background-body`,
  `--glass-background`, `--skeleton-base`…).
- Responsive: `@media` inline in the module, no separate files. Breakpoints: 480,
  525, 549, 600, 640, 768, 1024, 1440px.
- `@keyframes` in the module that uses them; timing via tokens. Every animation
  needs `@media (prefers-reduced-motion: reduce)`.
- Status badges: only `shared/styles/_statuses.scss` mixins; modifier via
  `data-status` or `--${status}` class.

## Components & UI

- `ui/ComponentName/{ComponentName.tsx, ComponentNameSkeleton.tsx, component-name.module.scss}`;
  generic components (buttons, skeletons) live in `shared/ui`.
- Mandatory `*Skeleton` (react-loading-skeleton) for any API-data component;
  `baseColor="var(--skeleton-base)"`, `highlightColor="var(--skeleton-highlight)"`.
- List-rendered components: `React.memo` + `displayName`. Portals
  (Drawer/Dialog/Dropdown) mount to `document.getElementById('modal-root')`.
- Haptics via `useHaptics()` (`web-haptics`): cart open/close → `soft()`; nav
  link/card → `soft()`; filter/sort → `light()`; submit/confirm → `success()`.

## State & RTK Query

- URL is the source of truth for catalog UI (`?q=`, `?sortBy=`, `?category=`) —
  never Redux.
- Slices/selectors in the slice's `model` segment (`entities/cart/model/slice.ts`);
  endpoints in `api` (`features/auth/api/authApi.ts`), injected into the base API
  in `shared/api`.
- redux-persist whitelist: `cart.items`, `theme.theme`, `auth.{user,token}`,
  `wishlist.favoriteItems`. RTK Query cache and transient UI state are not persisted.
- Optimistic updates: `onQueryStarted` + `updateQueryData`, rollback via
  `patchResult.undo()` on error. Derived state: `createSelector` (Reselect) only.

## Typing

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`. `any` only as a last
  resort, with a comment. Forms: Zod + `react-hook-form` via `@hookform/resolvers/zod`.
- Shared interfaces in `shared/types/`; local-only types stay in the
  component/model file.

## Routing & Performance

- Route config in `app/providers/RouterProvider` (or `app/router.tsx`); guards:
  `ProtectedRoute`, `PublicRoute`, `CheckoutGuard`. All pages lazy via `lazy()`
  except `CatalogPage` (direct import, instant load).
- Images: first 8 cards `loading="eager" fetchPriority="high"`; rest
  `loading="lazy" decoding="async" fetchPriority="low"`.
- `useMemo` for expensive computation, `useCallback` for child callbacks,
  `React.memo` for list items.

## Auth (Supabase)

- `useAuthSync` subscribes to `supabase.auth.onAuthStateChange` and syncs Redux.
- `SIGNED_IN`: merge local cart/wishlist (localStorage) → server, then clear local.
  `SIGNED_OUT`: reset RTK Query cache and cart/wishlist/auth slices.
- Supabase access outside `api/` segments is forbidden.

## Accessibility

- Semantic tags: `<article>` for cards/order rows; proper
  `<header>/<footer>/<nav>/<main>/<section>`; `.sr-only` for SR-only content.
- `aria-label` on icon-only buttons; `aria-live="polite"` for dynamic regions.
- Never remove `:focus-visible` without an alternative indicator; use
  `--focus-ring-color`, `--shadow-focus-button`. Touch targets:
  `$touch-target-min` (44px), `$touch-target-comfortable` (48px).

## Git Commits

English only, Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`,
`style:`, `test:`, `chore:`). One logical change per commit; keep dependent
cross-layer changes (API+components) together so history stays functional at
every point. Message describes the resulting change, no dev-process noise; body
only for large/complex changes. Review `git status` + diff before writing it.
