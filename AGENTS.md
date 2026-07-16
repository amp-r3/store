# AGENTS.md — Store Project (React 19 + TS + RTK + Supabase + FSD)

## Stack

React 19, TypeScript 5.9, Redux Toolkit 2.9 + RTK Query, redux-persist
(localStorage), React Router v7, Supabase (PostgreSQL+Auth), SCSS Modules + CSS
custom properties, React Hook Form + Zod, Vite 8 + LightningCSS.

## Architecture — Feature-Sliced Design (FSD)

The project strictly follows the
[Feature-Sliced Design](https://feature-sliced.design/) methodology. The
codebase is divided into architectural layers (from highest to lowest):

```text
src/
├── app/        # Initialization, routing, store setup, global styles
├── pages/      # Page components (composition of widgets/features/entities)
├── widgets/    # Complex standalone components (Header, ProductList, CartDrawer)
├── features/   # User interactions & use-cases (AddToCart, AuthForm, ThemeToggle)
├── entities/   # Business entities (User, Product, Cart, Order)
└── shared/     # Reusable logic, UI kit, configs, API base, utils
```

## Architecture — Feature-Sliced Design (FSD)

The project strictly follows the
[Feature-Sliced Design](https://feature-sliced.design/) methodology. The
codebase is divided into architectural layers (from highest to lowest):

```text
src/
├── app/        # Initialization, routing, store setup, global styles
├── pages/      # Page components (composition of widgets/features/entities)
├── widgets/    # Complex standalone components (Header, ProductList, CartDrawer)
├── features/   # User interactions & use-cases (AddToCart, AuthForm, ThemeToggle)
├── entities/   # Business entities (User, Product, Cart, Order)
└── shared/     # Reusable logic, UI kit, configs, API base, utils
```

### 1. Unidirectional Dependency Rule

A layer can only import from layers strictly below it:
`pages → widgets → features → entities → shared`.

- `shared` must NEVER import from `entities`, `features`, `widgets`, `pages`, or
  `app`. Not even a single type. If a config/helper in `shared` needs a domain
  type (e.g. `OrderStatus`), that file does not belong in `shared` — move it
  into the entity/feature that owns the type.
- `entities` must NEVER import from `features`, `widgets`, `pages`. If an
  entity's API needs a type that currently lives in a feature (e.g.
  `CreateOrderPayload` used by `entities/order/api`), the type belongs in the
  entity, not the feature — move it down, not the import up.
- `features` must NEVER import from `widgets` or `pages`. Before importing
  anything from `@/pages/*`, stop — that import is wrong by construction. Move
  the shared type/logic into the feature itself.
- Real-world smell: if two slices end up importing from each other in opposite
  directions (even indirectly, via different files), that's a circular
  dependency and always means something is misplaced — usually a type or config
  that should live one layer lower than where it currently sits.

**Before finishing any task, grep for violations of this rule**, not just fix
the one file you were pointed at:

```bash
grep -rn "from '@/features" src/entities/
grep -rn "from '@/widgets\|from '@/pages'" src/features/
grep -rn "from '@/entities\|from '@/features\|from '@/widgets\|from '@/pages'" src/shared/
```

### 2. Slices & cross-imports on the same layer

Cross-imports between **feature** slices are forbidden for runtime code (components, hooks, actions, selectors) — orchestrate composition at `widgets`/`pages`.

**Exception — type-only imports are allowed** between feature slices, when a type genuinely belongs to one feature's domain but another feature needs to reference it (e.g. a shared discriminated union, a payload shape):
```ts
// ✅ allowed — type-only, erased at compile time, no runtime coupling
import type { CheckoutStep } from '@/features/checkout-process';

// ❌ still forbidden — runtime import between features
import { useCheckoutTotals } from '@/features/checkout-process';
```
Use `import type` explicitly (not a regular `import` that happens to only use a type) so the exception is visually auditable via grep. Before reaching for this exception, ask: does this type actually represent a business entity concept (e.g. order status, product size) rather than a UI/feature-specific shape? If so, it still belongs in `entities`, not behind a type-only exception.

### 3. Segments

Inside a slice, code is structured by technical purpose: `ui/` (components),
`model/` (state, slice, selectors, types), `api/` (RTK Query endpoints), `lib/`
(utils, hooks), `config/` (static config that depends on the slice's own domain
types).

### 4. Public API (index.ts) — no bypassing, ever

Every slice MUST have an `index.ts` file at its root. Other slices/layers must
only import through it. This is the rule that gets violated most often and most
silently — treat it as a hard constraint on every import you write or touch, not
just the ones a task explicitly mentions.

**Concrete anti-patterns to never introduce:**

```ts
// ❌ Relative path crossing a slice boundary
import { ProductGallery } from "../../../widgets/product-gallery/ProductGallery";

// ❌ Alias import reaching past another slice's index.ts
import { OrderCard } from "@/entities/order/ui/order-card/OrderCard";
import { DeliveryMethod } from "@/features/checkout-process/model/types";

// ✅ Always via the slice's public API
import { ProductGallery } from "@/widgets/product-gallery";
import { OrderCard } from "@/entities/order";
import { DeliveryMethod } from "@/features/checkout-process";
```

Importing from your **own** slice's internal files via absolute alias (e.g. a
file inside `entities/order` importing `@/entities/order/model/types` instead of
`../model/types`) is not a layer violation — it's just a style choice, not
something to "fix" unless asked.

**Whenever you add a new component/hook/type that another slice needs, export it
from that slice's `index.ts` in the same task** — don't leave consumers to reach
in directly because "it's just one file."

**Self-check before declaring a task done**, run this and confirm zero relevant
results (excluding same-slice self-imports):

```bash
grep -rEn "from '(\.\./)+(entities|features|widgets|pages)" src/
grep -rEn "from '@/(entities|features|widgets|pages)/[a-zA-Z0-9_-]+/(model|ui|api|lib|config)" src/
```

### 5. Deciding pages vs widgets for a UI block

A block under `pages/<page-name>/ui/components/` belongs in `widgets/` instead only if **both** of these are true:

1. It imports from **two or more** `entities`/`features` slices (real composition of domain logic) — not just one entity for props typing.
2. It is plausibly reusable outside this one page (could appear in a modal, a quick-view, another page), even if it isn't reused today.

Calling `dispatch(...)`, RTK Query hooks, or `useNavigate` inside a page-local component is **not** by itself a reason to move it — plenty of legitimate page-local components manage their own page-specific state or trigger navigation. Treat store/navigation usage as a signal that *strengthens* the case when condition 1 is already met, not as a standalone trigger.

If only condition 1 is met but the block genuinely has no plausible reuse (e.g. it's tightly coupled to this page's specific layout/copy), it's fine to leave it in `pages` — don't move something just because it technically touches two entities. Use judgment; when in doubt, leave it where it is and flag it in your summary instead of moving it preemptively.

## Forbidden → Use Instead

- Cross-slice imports on the same layer (features↔features) → Compose at a
  higher layer (`widgets`/`pages`)
- Entity↔entity cross-imports that aren't read-only, one-directional, via public
  API → Don't add without flagging for review
- Importing bypassing `index.ts` (relative path or deep alias path) → Import
  only from the slice's public API (`index.ts`)
- Importing upwards (`shared→entities`, `entities→features`, `features→pages`,
  etc.) → Move the shared type/logic to the lower layer instead
- A `pages/*/ui/components/*` block that composes multiple entities/features or
  touches Redux/navigation directly → Move it to `widgets/`
- Hardcoded colors → CSS custom properties
- Hardcoded margins/sizes → SCSS tokens
- `any` → specific type or `unknown`
- Direct `supabase.*` in components → RTK Query endpoints inside `api/` segment
- `useDispatch()`/`useSelector()` → `useAppDispatch()`/`useAppSelector()`
- Catalog filters in Redux → URL via `useSearchParams`

## CSS Naming — strict BEM

`block__element--modifier`. In TSX: only `style['block__element--modifier']`.
Never raw string classNames.

## SCSS Rules

- One module per component, kebab-case, colocated in `ui/`:
  `Component/component-name.module.scss`.
- Tokens: `@use '@/shared/styles/index' as *;` only — no `@import`.
- No magic values — use tokens (`$spacing-md`, `$radius-lg`, `$fs-base`,
  `$transition-base`, `$ease-out-expo`, etc).
- No hardcoded colors — use CSS custom properties: `--primary-accent`,
  `--text-primary`, `--background-body`, `--glass-background`,
  `--skeleton-base`, etc.
- Responsive: `@media` inline in module, no separate files. Breakpoints: 480,
  525, 549, 600, 640, 768, 1024, 1440px.
- `@keyframes` declared in module of use; timing via tokens only.
- All animations must include `@media (prefers-reduced-motion: reduce)`.

## Components & UI

- Structure inside a slice segment:
  `ui/ComponentName/{ComponentName.tsx, ComponentNameSkeleton.tsx, component-name.module.scss}`.
- Shared generic components (buttons, skeletons) are placed in `shared/ui`.
- Mandatory `*Skeleton` (react-loading-skeleton) for any API-data component;
  colors via `baseColor="var(--skeleton-base)"` /
  `highlightColor="var(--skeleton-highlight)"`.
- List-rendered components: wrap in `React.memo`, set `displayName`.
- Portals (Drawer/Dialog/Dropdown) mount to
  `document.getElementById('modal-root')`.

## State Management & RTK Query

- URL is the source of truth for catalog UI (`?q=`, `?sortBy=`, `?category=`).
  Never in Redux.
- Redux slices and selectors live in the `model` segment of their respective
  slice (e.g., `entities/cart/model/slice.ts`).
- API slices/endpoints live in the `api` segment (e.g.,
  `features/auth/api/authApi.ts`). They inject endpoints into a base API defined
  in `shared/api`.
- redux-persist whitelist: `cart.items`, `theme.theme`, `auth.{user,token}`,
  `wishlist.favoriteItems`. RTK Query cache and transient UI state NOT
  persisted.
- Optimistic updates via `onQueryStarted` + `updateQueryData`, rollback via
  `patchResult.undo()` on error.
- Derived state selectors: `createSelector` (Reselect) only.

## Typing

- `tsconfig`: `strict: true`, `noUnusedLocals: true`,
  `noUnusedParameters: true`. `any` only as last resort + comment.
- Shared interfaces in `shared/types/`; local-only types stay in the
  component/model file.
- All forms: Zod schemas + `react-hook-form` via `@hookform/resolvers/zod`.

## Routing

- Routes configuration is in `app/providers/RouterProvider` (or
  `app/router.tsx`).
- All pages lazy via `lazy()`, except `CatalogPage` (direct import, instant
  load).
- Guards (`ProtectedRoute`, `PublicRoute`, `CheckoutGuard`) are used to protect
  routes.

## Auth (Supabase)

- `useAuthSync` subscribes to `supabase.auth.onAuthStateChange`, syncs Redux
  store.
- `SIGNED_IN`: merge local cart/wishlist (localStorage) → server, then clear
  local.
- `SIGNED_OUT`: reset RTK Query cache, cart/wishlist/auth Redux slices.
- Supabase access outside `api/` segments is forbidden.

## Performance

- Lazy-load all routes except `CatalogPage`.
- Images: first 8 cards `loading="eager" fetchPriority="high"`; rest
  `loading="lazy" decoding="async" fetchPriority="low"`.
- `useMemo` for expensive computation, `useCallback` for child callbacks,
  `React.memo` for list items.

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

Use only `shared/styles/_statuses.scss` mixins. Modifier via `data-status` or
`--${status}` class.

## Forbidden → Use Instead

- Cross-slice imports on the same layer → Compose at a higher layer
  (`widgets`/`pages`) or extract to a lower layer (`entities`/`shared`)
- Importing bypassing `index.ts` → Import only from the slice's public API
  (`index.ts`)
- Importing upwards → Respect unidirectional data flow
- Hardcoded colors → CSS custom properties
- Hardcoded margins/sizes → SCSS tokens
- `any` → specific type or `unknown`
- Direct `supabase.*` in components → RTK Query endpoints inside `api/` segment
- `useDispatch()`/`useSelector()` → `useAppDispatch()`/`useAppSelector()`
- Catalog filters in Redux → URL via `useSearchParams`

## Git Commits

English only, Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`,
`style:`, `test:`, `chore:`). One logical change per commit; include dependent
cross-layer changes (API+components) in same commit to keep history functional
at every point. Message describes resulting change, no dev-process noise; body
only for large/complex changes. Review `git status`+diff before writing message.
