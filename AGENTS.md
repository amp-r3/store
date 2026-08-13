# CLAUDE.md

Guidance for Claude Code in this repo. `CLAUDE.md` symlinks `AGENTS.md` — edit `AGENTS.md`.

## Stack & Commands

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9, Redux Toolkit
2.9 + RTK Query, redux-persist (localStorage), Supabase (PostgreSQL + Auth
via `@supabase/ssr`), SCSS Modules + CSS custom properties, React Hook Form +
Zod. `pnpm dev`/`build`/`start`/`typecheck`(`tsc --noEmit`, alias
`tsc`)/`lint`/`lint:css`/`format`/`format:check`. Pure logic (money math,
Redux reducers/selectors, Zod schemas, stock/status gating) and key
interactive widgets/forms have Vitest coverage (`pnpm test:unit`) — see
"Unit & Component Tests" below; full-page composition and rendering modes
(SSR/ISR/CSR) still rely on manual exercise (curl for server-rendered
content; the user checks interactive behavior themselves). P0 storefront
flows have Playwright E2E coverage (`pnpm test:e2e`) — see "E2E Tests"
below.
Needs `.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL` (canonical/OG/sitemap URLs server-side, where
`window.location` isn't available — `shared/config/site.ts`).

A Husky `pre-commit` hook runs `lint-staged` (`lint-staged.config.js`):
ESLint `--fix` + Prettier on staged `.ts`/`.tsx`, Stylelint `--fix` +
Prettier on staged `.scss`, then a full `tsc --noEmit` (no per-file
mode exists) — sequential after the fixers, not concurrent, since a
concurrent run would read files ESLint's `--fix` is still writing.
~5s warm, ~12s on a cold `tsconfig.tsbuildinfo`. `git commit --no-verify`
bypasses it for WIP/rebase fixups — CI runs the same four checks
regardless, so bypassing only defers the failure. If a `--fix` collides
with unstaged hunks of a partially-staged file, lint-staged leaves a
backup stash; recover with `git stash list` / `git stash pop`.

## Entry Points & Data Flow

`app/layout.tsx` → `AppProviders.tsx` (`'use client'`, wraps `<Provider
store>` — no `<PersistGate>`, see FSD §6) → route groups: `app/(shop)/`
(`MainLayout`), `app/(auth)/` (`PublicRoute`), `app/checkout/`
(`CheckoutGuard`), `app/admin/` (`AdminRoute` + a server-side role check in
its own `layout.tsx`); guards live in `src/app/providers/`. `store.ts`
exports `makeStore()`, not a module singleton — it also evaluates in the
Node server process, so a shared instance would leak across concurrent SSR
requests; `AppProviders` creates one store per component via `useRef`,
starts `persistStore()` only client-side. `proxy.ts` (Next 16 renamed
`middleware.ts` → `proxy.ts`) refreshes the Supabase session cookie every
request and redirects unauthenticated visitors from `/user`, `/checkout`,
`/admin` pre-render.

Public data (products, categories, reviews, delivery/payment methods): dual
path — plain `fetch*` in each entity's `api/queries.ts`, called with the
anon client from Server Components, and the browser client from RTK Query
`queryFn` wrappers client-side. Private, user-scoped data (cart, wishlist,
orders, checkout) is RTK-Query-only. No external product API.

## Architecture — Feature-Sliced Design (FSD)

Strictly [FSD](https://feature-sliced.design/). Layers under `src/`, highest
→ lowest: `app/` (init, routing, store — **not** the Next.js `app/` router
at repo root) · `views/` (composition of widgets/features/entities — named
`views` not FSD's `pages`, since root-level Next.js `app/` would shadow
`src/pages`) · `widgets/` (Header, CartDrawer) · `features/` (`auth`,
`cart-actions`, `product-filter`) · `entities/` (User, Product, Cart, Order)
· `shared/` (reusable logic, UI kit, configs, API base).

1. **Unidirectional dependencies**: `views → widgets → features → entities →
   shared`, importing only from layers strictly below. If a lower layer
   "needs" a type from a higher one, **move the type down**, never the
   import up — a circular dependency means something is misplaced, usually
   one layer too high. Mechanically enforced by `eslint.config.ts`'s
   `no-restricted-imports` (one block per layer) — cross-slice direction
   only, not the same-slice/cross-feature cases below.
2. **Same-layer cross-imports**: runtime cross-imports between **feature**
   slices forbidden — compose at `widgets`/`views` instead. Exception:
   explicit `import type` when a type genuinely belongs to one feature's
   domain (write it literally so it stays greppable) — check first whether
   it's really a business-entity concept (order status, size), which
   belongs in `entities`. Entity↔entity cross-imports that aren't
   read-only/one-directional/via public API: flag before adding.
3. **Segments**: `ui/`, `model/` (state, selectors, types), `api/` (RTK
   Query), `lib/` (utils, hooks), `config/`.
4. **Public API (`index.ts`) — never bypass**: every slice MUST have a root
   `index.ts`; other slices import only through it (most-violated rule).
   Own-slice internal imports via absolute alias are a style choice, not a
   violation. Adding something another slice needs → export from
   `index.ts` **same task**. `@/entities/order/ui/order-card/OrderCard` ❌
   past `index.ts`; `@/entities/order` ✅.
5. **views vs widgets**: a `views/<page>/ui/components/` block moves to
   `widgets/` only if **both** hold: (1) imports from **two+**
   `entities`/`features` slices (real composition, not one entity for
   props typing), and (2) plausibly reusable elsewhere even if unused
   today. `dispatch`/RTK Query hooks/`useRouter` alone isn't a reason. When
   in doubt, leave in place.
6. **`'use client'` boundaries, two Supabase clients**: public-data slices
   (`entities/product`, `entities/review`, `features/product-filter`) each
   have two entry points — `index.ts` (client hooks/UI/RTK Query) and a
   sibling `server.ts` (only `fetch*` + types). A Server Component importing
   from a slice's main `index.ts` fails the build the moment its `export *`
   reaches a hook — any named import pulls its whole module graph. Import
   `@/entities/product/server` etc. instead; new server-callable query →
   export from **both** files, same task. `'use client'` goes on the
   outermost component needing interactivity, not every file it imports;
   `app/**/page.tsx` stays a Server Component passing data as props, client
   RTK Query hooks take over (`liveData ?? initialDataProp`) post-hydration.
   Never call `useSearchParams()` (directly or via `useUrlState`) in a
   component reachable from a page with `generateStaticParams` (currently
   `/product/[id]`) — throws `BailoutToCSRError`, `<Suspense>` doesn't
   reliably fix it here (verified empirically). Use local `useState`
   instead (`ProductPage`, `ProductReviews`, `useSelectedSize`) — fine
   elsewhere (client-only routes, or behind `<Suspense>` like `Navbar`).

**Self-check**: ESLint catches layer-direction violations. Grep for the two
cases it can't (quote-agnostic — codebase mixes quote styles). Same-slice
self-imports are expected noise in both — only flag hits where the imported
slice differs from the importing file's own slice:

```bash
grep -rEn "from [\"']@/(entities|features|widgets|views)/[a-zA-Z0-9_-]+/(model|ui|api|lib|config)" src/ app/  # deep import past index.ts (excl. */server.ts)
grep -rn "from [\"']@/features/" src/features/  # cross-feature runtime import
grep -rn "eslint-disable" src/ app/  # every suppression must carry a reason on the line above
```

`eslint.config.ts`'s five per-layer blocks each set `no-restricted-imports`
wholesale (flat config replaces a rule's value, it does not merge
options) — a new pattern must be added to **all five**, or a sixth
block added for `app/**`, never hoisted into a single repo-wide rule
(it would be dead inside `src/**` or silently disable these).

## Forbidden → Use Instead

Hardcoded colors → CSS custom properties; hardcoded margins/sizes → SCSS
tokens. `any` → specific type/`unknown`. Raw string classNames →
`style['...']`. Direct `supabase.*` in client components → RTK Query
endpoints in `api/` (browser client). Direct `supabase.*` server-side → the
entity's `api/queries.ts` `fetch*`, called with `createServerSupabaseClient()`
(request-scoped, cookie-aware) or `createStaticSupabaseClient()` (anon, no
cookies — `generateStaticParams`, shared static/ISR renders) — never the
browser `supabase` singleton server-side (no cookie access, not
request-isolated). `useDispatch()`/`useSelector()` →
`useAppDispatch()`/`useAppSelector()`. Catalog filters in Redux → URL via
`useSearchParams`/`searchParams` prop. `react-router*` → `next/link`,
`useRouter`/`usePathname`/`useSearchParams`/`useParams` from
`next/navigation` — not installed. `import.meta.env.VITE_*` →
`process.env.NEXT_PUBLIC_*` (client) / `process.env.*` (server) — Vite is
gone. `catch (err: any)` → `catch (err)` + `getErrorMessage(err)` from
`shared/lib` (handles RTK Query error shapes and raw exceptions — don't
hand-roll per call site). `console.log` → delete it, or `console.warn`/
`console.error` (`no-console` allows only those two). `dangerouslySetInnerHTML`
→ nothing; the one legitimate sink (JSON-LD in
`app/(shop)/product/[id]/page.tsx`) carries an
`eslint-disable-next-line react/no-danger` naming its sanitizer, and any
new one must do the same. Unused import → deleted automatically by
`unused-imports/no-unused-imports --fix`; unused **local** must be
deleted, not `_`-prefixed (`_` silences ESLint for parameters only —
tsc's `noUnusedLocals` has no escape hatch).

## CSS / SCSS, Components & Accessibility

Strict BEM (`block__element--modifier`; in TSX only `style['...']`). One
module per component, kebab-case, colocated:
`ui/ComponentName/{ComponentName.tsx, ComponentNameSkeleton.tsx,
component-name.module.scss}`; generic components in `shared/ui`. Tokens via
`@use '@/app/styles/index' as *;` only, never `@import`; no magic values
(`$spacing-md`, `$radius-lg`, `$fs-base`…) or hardcoded colors
(`--primary-accent`, `--text-primary`, `--skeleton-base`…). Responsive
`@media` inline; breakpoints 480/525/549/600/640/768/1024/1440px.
`@keyframes` colocated, every animation needs
`@media (prefers-reduced-motion: reduce)`. Status badges: only
`app/styles/_statuses.scss` mixins, modifier via `data-status`/`--${status}`.

Mandatory `*Skeleton` (react-loading-skeleton) for any API-data component.
List-rendered components: `React.memo` + `displayName`. Portals mount via
`getModalRoot()` (`shared/lib`) — lazy render-time lookup, never
module-scope `document.getElementById` (no `document` during SSR). Haptics
via `useHaptics()`: cart/nav → `soft()`; filter/sort → `light()`;
submit/confirm → `success()`. Semantic tags (`<article>` for cards/order
rows, proper landmark elements, `.sr-only`); `aria-label` on icon-only
buttons, `aria-live="polite"` for dynamic regions; never remove
`:focus-visible` without an alternative (`--focus-ring-color`); touch
targets `$touch-target-min`/`$touch-target-comfortable` (44/48px).

Stylelint enforces `stylelint-config-standard-scss` (`pnpm lint:css`)
with four deliberate overrides documented in `stylelint.config.mjs`:
BEM class pattern (the preset is kebab-only), legacy
`rgba(var(--x-rgb), a)` colour notation (the custom property holds a
channel triplet), `prefix` media-feature notation, and hand-written
vendor prefixes kept. A per-file `overrides` block grandfathers ~37
pre-existing camelCase class names — fixing them means renaming the
paired TSX component's `style['...']` references too, so it's a known,
accepted gap (same pattern as `checkout.draft` below), not something
to "fix" unprompted; new/changed code must be kebab-case BEM. Note the
rule doesn't see classes built via SCSS `&__element` nesting (only
literal `.block__element` selectors), so nested BEM naming isn't
currently enforced. `@keyframes` names and `$variables` are kebab-case.

## State & RTK Query

URL is the source of truth for catalog UI (`?q=`, `?sortBy=`, `?category=`)
— never Redux. Slices/selectors in `model`; endpoints in `api`, injected
into the base API in `shared/api`. redux-persist is per-slice, not one root
`persistReducer` — no theme slice exists (dual-theming is pure CSS). `auth`
→ `whitelist: ['user']` + `stripAccessToken` transform; `cart` →
`['items']`; `wishlist` → `['favoriteItems']`; `checkout` → `['items',
'draft']`. `checkout.draft` sits in plaintext localStorage until
`clearCheckoutDraft()` runs — **known, accepted gap, don't "fix"
unprompted**. RTK Query cache and transient UI state aren't persisted.
Optimistic updates: `onQueryStarted` + `updateQueryData`, rollback via
`patchResult.undo()`. Derived state: `createSelector` only. Own-slice
selectors: type `state` via same-slice import, not `any`; reserve ambient
`GlobalRootState` (`app/store.ts`) for genuine cross-entity reads (e.g.
`reviewApi` reading `auth.user`).

## Typing

`strict: true`, `noUnusedLocals`, `noUnusedParameters`. `pnpm typecheck`
is the gate and also runs on every commit; `any` is an ESLint `error`,
not just a convention — used only as a last resort with a comment.
Forms: Zod + `react-hook-form` via
`@hookform/resolvers/zod`. Shared interfaces in `shared/types/`; local-only
types stay in the component/model file.

Supabase clients use the generated `Database` generic, so query results are
typed automatically — never hand-write a `*Response`/`*Row` interface to
mirror a table shape; prefer inference from the query, or compose a named
type from `Database['public']['Tables']['x']['Row']`. Two narrow,
**documented** cast patterns remain legitimate at the query boundary:
**views** (Postgres can't express view-column `NOT NULL`, so a single
`data as unknown as Domain[]` commented with why is correct — no defensive
mapper for a nullability that isn't real), and **`Json` columns/RPC args**
(`jsonb`/`SECURITY DEFINER` params generate as `Json` with no shape
guarantee — a single documented cast at the boundary is correct). Genuinely
nullable columns (no `NOT NULL` in `schema.sql`, not a view/Json artifact)
are real gaps — handle with a fallback/type guard, not a hiding cast.

## Routing & Performance

File-based routing under root `app/`. Route groups: `(shop)`, `(auth)`,
`checkout`, `admin`. Guards (`ProtectedRoute`, `PublicRoute`,
`CheckoutGuard`, `AdminRoute`) render from each group's `layout.tsx`;
`admin/layout.tsx` also does a server-side role check ahead of `AdminRoute`.
Code-splitting per route is automatic. Rendering mode per route is
deliberate, not incidental (see FSD §6): `/product/[id]` — ISR
(`generateStaticParams` + `revalidate`, anon client). `/catalog` and `/` —
SSR with an anon client, seeding first paint via props, RTK Query takes over
post-hydration. `/wishlist`, `/user/*`, `/checkout/*`, `/admin/*` — CSR
behind guards, `force-dynamic`, `robots: { index: false }`.

Images: `next/image`, not manual `<img loading/decoding/fetchPriority>`.
`fill` (inside `position: relative`) for CSS-container-sized images; explicit
`width`/`height` for fixed-size thumbnails. `priority` for the one clear LCP
candidate per page. New remote hosts → `next.config.ts`'s
`images.remotePatterns`. Supabase host derives from
`NEXT_PUBLIC_SUPABASE_URL` via `shared/config/images.ts`'s
`SUPABASE_IMAGE_HOST` — never hardcode the project ref. Product images are
named, not pasted as URLs: `shared/config/productImages.ts`'s
`buildProductImageName`/`buildProductImageUrl` derive
`product-<id>-thumb.webp` / `product-<id>-<n>.webp` from `product.id`, and
`PRODUCT_IMAGE_RULES` holds the format/size/dimension limits the admin
product form's Media section validates against.
`useMemo`/`useCallback`/`React.memo` as usual.

## Server Cache & Revalidation

`/` and `/product/[id]` are ISR (`revalidate = 3600`, also `sitemap.ts`).
RTK Query's `invalidatesTags` only flushes the browser tab's cache — never
Next's Full Route Cache — so a mutation (admin edit, review, stock-consuming
order) stays invisible server-side/to crawlers for up to an hour without
explicit revalidation.

`src/shared/api/revalidate.ts` (`'use server'`): `revalidateProduct(id)` /
`revalidateProducts(ids)` (any signed-in user), `revalidateStorefront()`
(admin-only fan-out). Call from `onQueryStarted` after `queryFulfilled`
resolves (`adminProductsApi.ts`, `reviewApi.ts`, `orderApi.ts`'s
`createOrder`). With an optimistic patch also in play, revalidate in its own
nested `try/catch` **after** the rollback branch — a revalidation failure
must never roll back an already-succeeded mutation. Each Server Action
re-checks auth itself (`authz.ts`'s `getServerSession()`) — a public POST
endpoint regardless of caller UI. `@/shared/api/revalidate` and `.../authz`
are legal deep imports past `shared/api`'s `index.ts` (pull in
`server-only`/`next/headers`). `toggleReviewLike` deliberately skips
revalidation (high-frequency, low-stakes).

## Auth (Supabase)

Session lives in an httpOnly cookie via `@supabase/ssr`, not localStorage —
`authSlice.ts` strips the access token before it reaches redux-persist.
`proxy.ts` refreshes the cookie and redirects unauthenticated visitors from
`/user`, `/checkout`, `/admin` pre-render; client guards and
`admin/layout.tsx`'s server check are the second line of defense. OAuth
(Google) exchanges its code server-side in `app/auth/callback/route.ts`,
redirects to `.../complete/page.tsx`, which reads the pre-OAuth `from` path
from `sessionStorage` (stashed by `useOAuthSignIn.ts`) — Supabase doesn't
reliably round-trip custom query params through the provider. `useAuthSync`
syncs Redux with `onAuthStateChange`: `SIGNED_IN` merges local cart/wishlist
→ server then clears local; `SIGNED_OUT` resets RTK Query cache and
cart/wishlist/auth slices. Supabase access outside `api/` (client) or
`api/queries.ts` (server) is forbidden.

No email confirmation, no email-based password recovery — **deliberate**
(portfolio project, reviewer shouldn't need a real inbox). Both toggles are
dashboard-only — `supabase/config.toml` has no `[auth]` section, so **never
run `supabase config push`** (would overwrite remote `site_url`,
`uri_allow_list`, Google config with CLI defaults). Password changes go
through `ChangePasswordForm` (re-auth required).

**Admin role**: `profiles.role` (`user_role` enum), not a JWT claim (needs a
dashboard Auth Hook, incompatible with never running `config push`). RLS
reads it via `public.is_admin()` (`SECURITY DEFINER`, avoids recursion).
Admin-only writes are `SECURITY DEFINER` RPCs checking `is_admin()`
themselves, never a role-gated policy — RLS has no column granularity,
`orders`/`order_items` keep zero write policies by design. `profiles` grants
`UPDATE` only on specific columns — `role` excluded. No admin signup path —
grant manually per README.

## Database Schema & Migrations

Linked via Supabase CLI; `DATABASE_URL` (pooler, session mode) in
`.env.local` (gitignored) — **read-only inspection** only. Generated TS
types: `database.types.ts` (`supabase gen types typescript --linked > ...`).
Schema dump: `supabase/schema.sql` — source of truth for table
shapes/constraints/RLS before writing any query (`supabase db dump --schema
public > ...`). Both **generated**, never hand-edit; regenerate together
after any schema change.

**Hard rule — schema changes only through the CLI**: `supabase migration new
<name>` → edit the SQL file → `supabase db push`. Never the dashboard SQL
editor, `psql`/`DATABASE_URL` DDL, or ad-hoc SQL outside a migration.

## Unit & Component Tests

Vitest, `vitest.config.ts` at repo root, `pnpm test:unit` (`test:unit:watch`
for watch mode, `test:unit:coverage` for a `@vitest/coverage-v8` report — CI's
`check` job runs the coverage variant). One config, two `test.projects`
(`extends: true` inherits `resolve.alias`/`env`/`exclude` from the root
config into both):

`coverage` is declared once at root (not per-project) so `unit` and
`component` merge into one report; reporters are `text`/`html`/`lcov`
(`coverage/`, gitignored). **Deliberately no `coverage.thresholds`** — most
of `src/` (admin, most `views/`/`widgets/`) has no test coverage by design
(see the P0 rationale under "E2E Tests"), so a repo-wide gate would fail
immediately and just get disabled. Add narrow per-glob thresholds only on
directories that actually have tests, once that coverage is deliberately
built out further. The `text` reporter's terminal table silently drops some
fully-covered files under this two-project setup (a cosmetic quirk of
istanbul's report merging, not a data problem) — trust `coverage/lcov.info`
or the HTML report over the terminal table when a specific file's number
matters.

- **`unit`** — `environment: 'node'`, `include: ['src/**/*.test.ts']`. Pure
  logic only: money math, Redux reducers/selectors, Zod schemas,
  stock/status gating, order-progress derivation.
- **`component`** — `environment: 'jsdom'`, `include: ['src/**/*.test.tsx']`,
  `setupFiles: ['./vitest.setup.ts']`. React Testing Library (`@testing-
  library/react` + `user-event` + `jest-dom`) for key interactive
  widgets/forms — cart, catalog/product cards, filters/sort, auth and
  checkout forms. Not full-page composition or SSR/ISR/CSR rendering
  modes — that's still manual exercise or Playwright's job (see "E2E
  Tests").

`.test.ts`/`.test.tsx` (not `.spec.ts`), colocated next to the component,
to stay lexically distinct from `e2e/specs/*.spec.ts` and route to the
right project by extension. A slice/selector/schema test can stay `.test.ts`
(node) even when the module it tests touches the Supabase client directly
(e.g. `authSlice.ts` importing `authApi` for its `extraReducers` matchers) —
the browser client itself has no Next-specific import. Only
`createTestStore()`/`makeStore()` (`@/app/store.ts`) forces `.test.tsx`: that
module side-effect-imports `@/entities/order`/`review` to register their RTK
Query endpoints, and those pull in `@/shared/api/revalidate`, which
`vitest.setup.ts`'s mock only applies to the component project (see below).
`cartApi.test.tsx`, `useCartActions.test.tsx`, and
`useLocalDataMerge.test.tsx` all need it for this reason;
`authSlice.test.ts` and `checkoutSlice.test.ts` don't, since neither calls
`createTestStore`. `e2e/**` is excluded at the root — Vitest's
default glob would otherwise collect the Playwright specs and fail. Vitest
does not read `tsconfig.json`'s `paths`, so `@/*` (`./src`) and `@test/*`
(`./test`) are both re-declared in `vitest.config.ts`'s `resolve.alias`. No
`"types": ["vitest/globals"]` in `tsconfig.json` (would narrow the ambient
`@types/*` auto-include) — every test file imports `describe`/`it`/`expect`/
etc. from `'vitest'` explicitly rather than relying on globals. `test.env`
stubs the three `NEXT_PUBLIC_*` vars so a module that reads them at import
time (e.g. `shared/config/images.ts`, which throws without
`NEXT_PUBLIC_SUPABASE_URL`) can't take the whole suite down — the CI `check`
job that runs `pnpm test:unit` carries no secrets, by design. `next/image`
needs no mock: its unconfigured-host throw
(`node_modules/next/dist/shared/lib/image-loader.js`) is gated on
`process.env.NODE_ENV !== 'test'`, which Vitest sets.

**`vitest.setup.ts`** (component project only) stubs what jsdom doesn't
implement: `matchMedia` (defaults `matches: false` — components branch to
their desktop layout, e.g. `SortControl`/`CategoryControl` render the Radix
dropdown, not the mobile bottom sheet, unless a test overrides it),
`ResizeObserver`/`IntersectionObserver`, `scrollIntoView`,
`URL.createObjectURL`/`revokeObjectURL`, and the Pointer Events capture
methods (`setPointerCapture`/`releasePointerCapture`/`hasPointerCapture` —
vaul/Radix drag-based primitives call these on any pointerdown inside their
content). It also globally mocks `@/shared/api/revalidate`: that module is a
Next.js Server Action (`'use server'`) whose real body imports `next/cache`
and `authz.ts`'s `server-only` — a build-time convention with no actual npm
package, unresolvable outside a Next build. `@/app/store.ts`'s `makeStore()`
side-effect-imports `@/entities/order`/`review` purely to register their RTK
Query endpoints, so this mock is required for *any* `renderWithProviders`
render, not just ones exercising a revalidating mutation. Radix/vaul portals
(`CartDrawer`, modals, dropdowns) fall back to `document.body` when
`getModalRoot()`'s `#modal-root` lookup returns `null` — no fixture needed.

**`test/`** (repo root, alongside `e2e/` — outside `src/`, deliberately: the
FSD `no-restricted-imports` blocks glob `src/<layer>/**/*.{ts,tsx}`, which
includes colocated `*.test.tsx`, so a helper importing `makeStore` from
`@/app/store` couldn't live under `src/shared/**`) holds shared test
infrastructure, imported via the `@test/*` alias:

- `renderWithProviders.tsx` — wraps a component in `<Provider store={store
  ?? makeStore()}>`. Deliberately doesn't reuse `AppProviders`
  (`src/app/providers/AppProviders.tsx`): that also renders `AppEffects`
  (`useAuthSync`/`useNotificationsSync` → live Supabase) and starts
  `persistStore()`, both gated on `typeof window !== 'undefined'`, true
  under jsdom. Exports `createTestStore` (= `makeStore`) for tests that need
  to seed the store *before* mount — see below. `cartItems` seeds
  `cart.items` synchronously via the real `restoreCart` action; `authUser`
  (a `SessionUser`) dispatches the real `setSession` before render so
  `selectIsAuth` is true — used for the authenticated branch of RTK Query
  mutations/hooks (`cartApi.test.tsx`, `useCartActions.test.tsx`) instead of
  reaching into `preloadedState` (off-limits — see the file's own comment on
  RTK's generic-inference conflict).
- `seedApi.ts` — `seedSizes`/`seedProductArray`/`seedDeliveryMethods`/
  `seedMyReviews`/`seedCart` wrap the matching entity API's
  `util.upsertQueryData`, pre-filling the RTK Query cache so a component's
  `useXQuery` finds data already present instead of firing its real
  `queryFn`. **`upsertQueryData` is async (returns a promise) — it must be
  awaited on a store built via `createTestStore()` *before* that store is
  handed to `renderWithProviders`.** Seeding after render is too late: a
  component subscribes to its query on mount, and with no cached data yet it
  fires the real `queryFn` (hitting the unmocked Supabase client, and
  reading loading-state defaults like `stock ?? 0` in the meantime) —
  `src/entities/cart/ui/cart-item/CartItem.test.tsx` is the reference
  example of the build-store → await-seed → render sequence. `seedCart`
  seeds `cartApi`'s `getCart` query specifically — the authenticated-cart
  equivalent of `cartItems` seeding the guest cart's Redux slice.
- `supabaseStub.ts` — `createSupabaseStub()` mocks
  `@/shared/api/supabase/client`'s `supabase` singleton. Every RTK Query
  `queryFn` in this repo goes through it (`supabase.auth.*` directly, or a
  `fetch*(supabase, ...)` helper in `api/queries.ts` chaining off
  `.from(table)...`), so one mock controls every network path a component
  test can hit. `.from()` returns a thenable Proxy chain (`createChain`) —
  any property access returns a function returning the same proxy, so an
  arbitrarily long `.select().eq().order().single()` resolves without
  enumerating each method; only `.then` breaks the chain. `__setTable(table,
  result)` reconfigures a table's response after creation, since different
  tests in the same file often need different responses from the one
  `vi.mock`-created instance (e.g. a happy-path list vs. an error) — see
  `CartDrawer.test.tsx`. To reconfigure the stub from inside a test, import
  the *real* specifier (`import { supabase } from
  '@/shared/api/supabase/client'`) after mocking it with a **dynamic**
  `import()` inside the factory (`vi.mock('@/shared/api/supabase/client',
  async () => { const { createSupabaseStub } = await
  import('@test/supabaseStub'); return { supabase: createSupabaseStub() };
  })`) — a top-level `const stub = createSupabaseStub()` referenced by the
  factory hits `vi.mock`'s hoist-above-imports semantics (the binding is
  still in its TDZ when the hoisted factory runs); the dynamic import
  sidesteps it. Cast the imported `supabase` to `SupabaseStub` to call
  `__setTable`/`vi.fn()` methods on it. Also stubs `auth.getSession` (every
  `cartApi`/`wishlistApi` mutation reads the session this way, not via
  `getUser`) and `auth.onAuthStateChange`, whose registered callback is
  driven from a test via `__emitAuthChange(event, session)` — this is what
  exercises `useSessionSync`/`useLocalDataMerge`
  (`useLocalDataMerge.test.tsx`), since neither hook is reachable any other
  way. `__getCalls(table?)` returns every `.from(table)...` chain call
  recorded so far as `{ table, method, args }` — `createChain`'s Proxy
  otherwise discards call arguments, so this is the only way to assert
  *what payload* a `.upsert(...)`/`.insert(...)` actually received (e.g.
  confirming a cart-merge upsert carries the right rows). **The stub
  instance is shared across every test in a file** (`vi.mock`'s factory
  runs once per file) — `__reset()` restores tables/rpc to the stub's
  original config and clears recorded calls + auth-change callbacks; call
  it in `beforeEach` whenever a file uses `__setTable` with an error
  and later asserts a success path, or uses `__getCalls` — see
  `cartApi.test.tsx` for the reference pattern (its "success paths" tests
  failed by reading a prior test's error config until `__reset()` was
  added).
- `fixtures.ts` — `makeProduct`/`makeSize`/`makeCartItemDetails`/
  `makeDeliveryMethod`/`makeCategory` factories with sensible defaults +
  overrides, typed from each entity's public API.

**Mocking `next/navigation`**: give `useRouter`/`useSearchParams` **stable
object references**, not a fresh object per call
(`src/features/auth/ui/login-form/LoginForm.test.tsx` has the reference
pattern). `useTransitionRouter` and `useUrlState` put the router/
searchParams object straight into `useCallback`/`useEffect` dependency
arrays (the same pattern `0b7f8ee` fixed in production) — a mock returning
`() => ({ push: vi.fn(), ... })` recreates that object every render,
producing an infinite re-render loop (observed as a Vitest worker OOM, not
a clean test failure) instead of a one-time mount.

Colocated test files are subject to the same FSD `no-restricted-imports`
blocks (§1) as any other file in their layer — a test under `src/shared/**`
still can't import `@/entities`/`@/features`/etc. (`@test/*` is a distinct
alias, not `@/`-prefixed, so it isn't covered by those blocks). Any logic
that needs testing but lives behind `next/headers` or otherwise can't run
under jsdom even with `next/navigation`/Supabase mocked is out of scope
here — extract the pure part into its own module first if it's worth
covering, the way `computeMaxReachedIndex` was pulled out of
`useCheckoutStepper.ts` into its own file.

**Query conventions** (component tests): role/label/text first —
`screen.getByRole`/`getByLabelText`/`getByText` — `data-testid` only where
no accessible name exists or the same name is duplicated in the DOM (same
rule "E2E Tests" states below; `cart-item-quantity` is the component-test
example — the quantity value and a size chip are both bare digits with no
accessible name to key off). Use `findBy*`/`waitFor` for anything that
settles after a render (debounced filters, a seeded RTK Query cache
resolving, a mutation's pending state) rather than asserting synchronously
on a query that resolves a tick later.

## E2E Tests

Playwright, `e2e/` at repo root (outside `src/` — the FSD
`no-restricted-imports` blocks don't apply there). Runs against the **live
Supabase project**, not a local stack — no `supabase/seed.sql` exists, and
a `supabase start` database would be schema-only with no products,
categories, or delivery/payment methods. `pnpm test:e2e` (`--ui` /
`--report` variants too).

**P0 scenarios covered** (agreed before writing any test — the ones whose
breakage costs actual conversion/revenue on the day it ships):

| Spec | Scenario | Why P0 |
|---|---|---|
| `catalog.spec.ts` | Search/category/sort on `/catalog`, empty state, → PDP | Entry point of every funnel; broken search/catalog = zero traffic reaches a product |
| `cart.spec.ts` | Guest add-to-cart, qty controls, reload persistence, guest→checkout guard bounce | Captured purchase intent; a silent rehydration/`sizeId`-keying regression drops carts with no error surfaced |
| `auth.spec.ts` | Protected-route redirect, wrong/right credentials, session-survives-reload, `/login` bounce when authed | Identity gates orders, cart sync, order history |
| `checkout.spec.ts` | Full 3-step checkout → `Place Order` → success → order in `/user/orders` | The money path — the only test exercising `create_order` end to end |

Wishlist, reviews, notifications, and `/admin` are deliberately **not**
covered — real functionality, but not revenue-critical on release day.

**`checkout.spec.ts` places a real order** (stock-locking, fee computation,
`order_number` generation) against the live project. `e2e/auth.setup.ts`
creates/reuses a dedicated `E2E_USER_EMAIL` account (service-role key,
idempotent — email confirmation is off by design so it's usable
immediately) and logs in through the real UI so the session lands in
**cookies** (`@supabase/ssr`), which is what `proxy.ts` reads — a
`setSession()` shortcut would only populate localStorage and the guard
would still bounce it. `e2e/global.teardown.ts` (also service-role, since
`orders`/`order_items` have zero write policies for the anon/user key)
restores the stock `create_order` decremented and deletes the orders it
created — idempotent, safe to re-run after an interrupted run.

Required env vars (local `.env` + CI repo secrets):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `E2E_USER_EMAIL`,
`E2E_USER_PASSWORD` — `e2e/support/env.ts` fails fast with a clear message
if one is missing.

**Selectors**: role/label first — `FormField` renders a real `<label
htmlFor>`, so `getByLabel('Email')` etc. works throughout auth and
checkout. `data-testid` only where no accessible name exists or the same
name is duplicated in the DOM (e.g. `Navbar`/`MobileBar` both render a cart
button regardless of viewport — CSS hides the inactive one, so `getByRole`
alone would hit Playwright's strict-mode "2 elements" error; disambiguate
with `[data-testid="cart-open"]:visible`, not by picking one accessible
name). Never select on a hashed SCSS Module class name. No
`page.waitForTimeout` — wait on the URL/DOM state a debounce eventually
produces (search 300 ms, sort/category 150 ms), or on
`page.waitForResponse` for a specific round-trip (`create_order`).

## Git Commits

English only, Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`,
`style:`, `test:`, `chore:`). One logical change per commit; keep dependent
cross-layer changes together. No dev-process noise, no `Co-Authored-By`
trailer; body only for large/complex changes.

The `style:` Prettier reformat commit is listed in
`.git-blame-ignore-revs`; GitHub applies it automatically, run once
per local clone: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
