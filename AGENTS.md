# CLAUDE.md

Guidance for Claude Code in this repo. `CLAUDE.md` symlinks `AGENTS.md` — edit `AGENTS.md`.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9, Redux Toolkit
2.9 + RTK Query, redux-persist (localStorage), Supabase (PostgreSQL + Auth
via `@supabase/ssr`), SCSS Modules + CSS custom properties, React Hook Form +
Zod.

## Commands

- `pnpm dev` — Next dev server (`http://localhost:3000`). `pnpm build` —
  production build (`next build`). `pnpm start` — serve that build. `pnpm tsc`
  — type-check only (`tsc --noEmit`). `pnpm lint` — ESLint (`eslint.config.ts`,
  built on `eslint-config-next`).
- **No test runner** (no Vitest/Jest, no `test` script) — don't assume test infra
  exists; verify via `pnpm tsc`, `pnpm lint`, and manual exercise of the flow
  (curl for server-rendered content — see Routing & Performance — the user
  checks interactive/browser behavior themselves).
- Needs `.env` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  for auth, cart, wishlist, orders, and `NEXT_PUBLIC_SITE_URL` (used to build
  absolute canonical/OG/sitemap URLs server-side, where `window.location`
  isn't available — see `shared/config/site.ts`).

## Entry Points & Data Flow

- `app/layout.tsx` (root) → `app/providers/AppProviders.tsx` (`'use client'`,
  wraps `<Provider store>` — no `<PersistGate>`, see FSD §6) → route groups:
  `app/(shop)/` (public storefront + wishlist, `MainLayout`), `app/(auth)/`
  (login/register, `PublicRoute`), `app/checkout/` (`CheckoutGuard`),
  `app/admin/` (`AdminRoute` + a server-side role check in its own
  `layout.tsx`). Guards live in `src/app/providers/`.
- `proxy.ts` (repo root; Next 16 renamed `middleware.ts` → `proxy.ts`) refreshes
  the Supabase session cookie every request and redirects unauthenticated
  visitors away from `/user`, `/checkout`, `/admin` before any page renders.
- All server data (catalog, auth, cart, wishlist, orders) comes from Supabase.
  Public data (products, categories, reviews, delivery/payment methods) has a
  dual path: plain async functions in each entity's `api/queries.ts` (`fetch*`,
  taking a `SupabaseClient<Database>`), called with the anon client from
  Server Components for SSR/ISR, and with the browser client from thin
  `queryFn` wrappers in the same entity's RTK Query `api/*Api.ts` for
  client-side fetching/caching/mutations. Private, user-scoped data
  (cart, wishlist, orders, checkout) stays RTK-Query-only. No external product
  API.

## Architecture — Feature-Sliced Design (FSD)

Strictly [FSD](https://feature-sliced.design/). Layers under `src/`, highest →
lowest: `app/` (init, routing, store, global styles — the FSD app layer;
**not** the Next.js `app/` router at the repo root, see below) · `views/`
(composition of widgets/features/entities — named `views` rather than FSD's
usual `pages`, since a root-level Next.js `app/` directory silently shadows
any `src/pages`, see §6) · `widgets/` (complex standalone components — Header,
ProductList, CartDrawer) · `features/` (user interactions — AddToCart, AuthForm,
ThemeToggle) · `entities/` (business entities — User, Product, Cart, Order) ·
`shared/` (reusable logic, UI kit, configs, API base, utils).

### 1. Unidirectional dependencies

A layer imports only from layers strictly below:
`views → widgets → features → entities → shared`. `shared` never imports from
any layer above it — not even a type; `entities` never from
`features`/`widgets`/`views`; `features` never from `widgets`/`views`. If a
lower layer "needs" a type from a higher one (e.g. `CreateOrderPayload` in
`entities/order/api`), **move the type down**, never the import up. Two slices
importing each other in opposite directions (even indirectly) = circular
dependency = something is misplaced, usually one layer too high.

### 2. Same-layer cross-imports

Runtime cross-imports between **feature** slices (components, hooks, actions,
selectors) are forbidden — compose at `widgets`/`views` instead. **Exception:**
explicit `import type` between features, when a type belongs to one feature's
domain and another must reference it; write `import type` literally so the
exception stays greppable. First ask whether the type is really a
business-entity concept (order status, product size) — then it belongs in
`entities`, not behind this exception.

```ts
import type { StepType } from '@/features/checkout-process';   // ✅
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

### 5. views vs widgets

A block in `views/<page>/ui/components/` moves to `widgets/` only if **both**
hold: (1) it imports from **two or more** `entities`/`features` slices (real
domain composition, not one entity for props typing), **and** (2) it's plausibly
reusable outside this page (modal, quick-view, another page) even if unused
today. `dispatch(...)`, RTK Query hooks or `useRouter` alone is **not** a
reason to move — it only strengthens a case where (1) already holds. If (1)
holds but the block is glued to this page's layout/copy, leave it and say so in
your summary. When in doubt, leave it in place.

### 6. `'use client'` boundaries and the two Supabase clients

Public-data slices (`entities/product`, `entities/review`, and the pieces of
`features/product-filter`/`features/product-sort` a Server Component needs)
each have **two** public entry points: the usual `index.ts` (client hooks, UI,
RTK Query — `export *`, so it transitively pulls in everything that uses
`useState`/`useSyncExternalStore`/etc.) and a sibling `server.ts` (only the
plain `fetch*` functions from `api/queries.ts` and their types — no hooks, no
UI). A Server Component (any `app/**/page.tsx` or `layout.tsx` without
`'use client'`) that imports **anything** from a slice's main `index.ts`
fails the build the moment that barrel's `export *` reaches a hook — Next
analyzes the whole module graph behind a named import, not just the symbols
actually used. Import from `@/entities/product/server` (etc.) instead. When a
slice gains a new server-callable query function, export it from **both**
`index.ts` (for the RTK Query wrapper) and `server.ts` (for RSC callers) in
the same task — see `entities/product/server.ts`, `entities/review/server.ts`,
`features/product-filter/server.ts`, `features/product-sort/server.ts` for
the existing pattern.

Put `'use client'` on the outermost component that actually needs
interactivity — the top of a `views/*/ui/*Page.tsx`, not on every file it
imports — matching AGENTS.md's general "mark the boundary, not every file"
rule. `app/**/page.tsx` files stay Server Components (async, no directive)
and pass server-fetched data into the client view as props; the client view's
RTK Query hooks then take over (`liveData ?? initialDataProp`) after
hydration, keyed to the same cache tags mutations already invalidate.

Never call `useSearchParams()` (directly, or via `useUrlState`) in a
component reachable from an `app/**/page.tsx` that also has
`generateStaticParams` (currently `/product/[id]`) — it throws
`BailoutToCSRError` during static generation in this Next version, and
wrapping it in `<Suspense>` does not reliably fix it (this version's static
generation does not consistently block on resolving that boundary — verified
empirically, not merely undocumented). Use local `useState` for that kind of
in-page UI state instead (see `ProductPage`'s image-zoom-modal flag,
`ProductReviews`' sort/filter/page, `useSelectedSize`) — none of it is core
enough to be worth losing SSR/ISR output over. `useSearchParams()` is fine
everywhere else (client-only routes, or any component already behind a
`<Suspense>` boundary like `Navbar`/`MobileBar` in `MainLayout.tsx`).

### Self-check before finishing any task

Grep repo-wide — not just the file you were pointed at. Expect zero results
(same-slice self-imports, and the deliberate `*/server.ts` deep imports from
§6, excluded):

```bash
grep -rn "from '@/features" src/entities/
grep -rn "from '@/widgets\|from '@/views'" src/features/
grep -rn "from '@/entities\|from '@/features\|from '@/widgets\|from '@/views'" src/shared/
grep -rEn "from '(\.\./)+(entities|features|widgets|views)" src/
grep -rEn "from '@/(entities|features|widgets|views)/[a-zA-Z0-9_-]+/(model|ui|api|lib|config)" src/ app/
```

## Forbidden → Use Instead

- Hardcoded colors → CSS custom properties. Hardcoded margins/sizes → SCSS tokens.
- `any` → specific type or `unknown`. Raw string classNames → `style['...']`.
- Direct `supabase.*` in client components → RTK Query endpoints in an `api/`
  segment (browser client, `shared/api`'s `supabase`). Direct `supabase.*` in
  a Server Component/Route Handler/Server Function → the entity's
  `api/queries.ts` `fetch*` functions, called with `createServerSupabaseClient()`
  (request-scoped, cookie-aware — `shared/api/supabase/server.ts`) or
  `createStaticSupabaseClient()` (anon, no cookies — for `generateStaticParams`
  and any RSC render whose output is a shared static/ISR page rather than a
  genuinely per-request response). Never the browser `supabase` singleton
  server-side — it has no cookie access and its module-scope instantiation
  isn't request-isolated.
- `useDispatch()`/`useSelector()` → `useAppDispatch()`/`useAppSelector()`.
- Catalog filters in Redux → URL via `useSearchParams` (client) / the
  `searchParams` prop (Server Component page).
- `react-router`/`react-router-dom` (`Link`, `useNavigate`, `useLocation`,
  `useParams`, `<Outlet/>`) → `next/link`, `useRouter`/`usePathname`/
  `useSearchParams`/`useParams` from `next/navigation`, layout `children`
  prop. Not installed — nothing should import them.
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*` (client-readable) or
  `process.env.*` (server-only, no `NEXT_PUBLIC_` prefix). Vite is gone;
  nothing should reference `import.meta`.
- `catch (err: any)` → `catch (err)` (already `unknown` under `strict`) +
  `getErrorMessage(err)` from `shared/lib` for the display string. It handles
  both RTK Query error shapes (`FetchBaseQueryError`/`SerializedError`) and raw
  thrown exceptions — don't hand-roll `err?.message || err?.data` per call site.

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
- Status badges: only `app/styles/_statuses.scss` mixins; modifier via
  `data-status` or `--${status}` class.

## Components & UI

- `ui/ComponentName/{ComponentName.tsx, ComponentNameSkeleton.tsx, component-name.module.scss}`;
  generic components (buttons, skeletons) live in `shared/ui`.
- Mandatory `*Skeleton` (react-loading-skeleton) for any API-data component;
  `baseColor="var(--skeleton-base)"`, `highlightColor="var(--skeleton-highlight)"`.
- List-rendered components: `React.memo` + `displayName`. Portals
  (Drawer/Dialog/Dropdown) mount via `getModalRoot()` (`shared/lib`) — a lazy,
  render-time lookup of `#modal-root`, never a module-scope
  `document.getElementById` call, which would crash on the server (no `document`
  during SSR).
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
- Selectors reading only their own slice: type `state` against that slice's own
  state type via a same-slice import (e.g. `(state: { auth: AuthState }) => ...`
  in `entities/session/model/authSelectors.ts`), not a hand-rolled `any`. Reserve
  the ambient `GlobalRootState` (declared via `declare global` in `app/store.ts`)
  for the genuine cross-entity case — e.g. `reviewApi`'s `onQueryStarted` needing
  to read `auth.user` from inside the `review` entity, where `getState()`'s own
  RTK Query type only knows about `reviewApi`'s own slice.

## Typing

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`. `any` only as a last
  resort, with a comment. Forms: Zod + `react-hook-form` via `@hookform/resolvers/zod`.
- Shared interfaces in `shared/types/`; local-only types stay in the
  component/model file.
- `shared/api/supabase/{client,server}.ts` create their respective clients
  with the generated `Database` generic (`src/shared/api/database.types.ts`,
  re-exported from `shared/api`), so `.from().select()`/`.rpc()` results are
  typed automatically — never
  hand-write a local `*Response`/`*Row` interface to mirror a table shape.
  Prefer inference from the query itself (see `entities/wishlist/api`,
  `entities/cart/api`); when a query embeds a relation or needs a named type
  (e.g. for a mapper's parameter), compose it from
  `Database['public']['Tables']['x']['Row']` (see `entities/review/api`,
  `entities/order/api`) rather than redeclaring the columns.
  - Two narrow, **documented** cast patterns remain legitimate, both at the
    query boundary only:
    - **Views**: Postgres can't express `NOT NULL` for a view column, so
      every column of a view (e.g. `products_view`) generates as `| null`
      even when the underlying table enforces it. A single
      `data as unknown as Domain[]` at the query site, commented with why, is
      correct — don't write a defensive mapper for a nullability that isn't
      real.
    - **`Json` columns/RPC args**: `jsonb` columns and `SECURITY DEFINER`
      RPC params/returns generate as `Json` with no shape guarantee from the
      DB. A single documented cast at the boundary (e.g.
      `shipping_address as unknown as ShippingAddress`) is correct.
  - Genuinely nullable columns (no `NOT NULL` in `supabase/schema.sql`, not a
    view/Json artifact) are real gaps — handle with a fallback or a filter/type
    guard at the mapper, not a cast that hides the null.

## Routing & Performance

- File-based routing under the root `app/`. Route groups: `(shop)` (public
  storefront, `MainLayout`), `(auth)` (login/register, no chrome), `checkout`,
  `admin`. Guards (`ProtectedRoute`, `PublicRoute`, `CheckoutGuard`,
  `AdminRoute`, `src/app/providers/`) are client components rendered from each
  group's `layout.tsx`; `admin/layout.tsx` additionally does a server-side
  role check (`redirect()` before any admin HTML reaches the browser) as a
  second, faster-failing line of defense ahead of `AdminRoute`. Code-splitting
  per route is automatic — no manual `lazy()`.
- Rendering mode per route (check before assuming a page is "just SSR" or
  "just CSR" — it's deliberate per route, see FSD §6 for why):
  `/product/[id]` — ISR (`generateStaticParams` + `revalidate`, anon Supabase
  client, real content baked into the static HTML). `/catalog` and `/`
  (home) — SSR with an anon client, seeding the client view's first paint via
  props (`initialProducts`/`initialCategories`/etc.), RTK Query takes over
  after hydration. `/wishlist`, `/user/*`, `/checkout/*`, `/admin/*` — plain
  CSR behind guards, `force-dynamic`, `robots: { index: false }` metadata (no
  SEO value, and `/user`/`/checkout`/`/admin` never even reach an
  unauthenticated crawler — `proxy.ts` redirects first).
- Images: `next/image`, not manual `<img loading/decoding/fetchPriority>`.
  `fill` (inside a `position: relative` parent) for anything sized by its CSS
  container (product cards, product gallery); explicit `width`/`height` for
  fixed-size thumbnails/avatars. `priority` for the one clear LCP candidate
  per page (product gallery hero) — not the old "first 8" rule, which
  `next/image`'s own lazy-loading-by-default supersedes. Add any new remote
  image host to `next.config.ts`'s `images.remotePatterns` (Supabase Storage
  and `*.googleusercontent.com` — Google OAuth avatars — are already there).
- `useMemo` for expensive computation, `useCallback` for child callbacks,
  `React.memo` for list items.

## Auth (Supabase)

- Session lives in an httpOnly cookie via `@supabase/ssr`
  (`createBrowserClient` in `shared/api/supabase/client.ts`,
  `createServerClient` in `shared/api/supabase/server.ts`), not localStorage
  — `authSlice.ts`'s persisted state strips the access token before it ever
  reaches redux-persist. `proxy.ts` refreshes that cookie every request and
  redirects unauthenticated visitors away from `/user`, `/checkout`, `/admin`
  before any page renders; the client-side guards (`ProtectedRoute` etc.) and
  `admin/layout.tsx`'s server-side role check are the second line of defense,
  not the primary one — see [Forbidden](#forbidden--use-instead) for which
  Supabase client to use where.
- OAuth (Google) exchanges its code server-side in
  `app/auth/callback/route.ts`, then redirects to
  `app/auth/callback/complete/page.tsx`, which reads the pre-OAuth `from`
  path out of `sessionStorage` (stashed by `useOAuthSignIn.ts` before the
  provider redirect) — Supabase doesn't reliably round-trip custom query
  params through the provider, so the query-string approach doesn't work here.
- `useAuthSync` subscribes to `supabase.auth.onAuthStateChange` and syncs Redux.
- `SIGNED_IN`: merge local cart/wishlist (localStorage) → server, then clear local.
  `SIGNED_OUT`: reset RTK Query cache and cart/wishlist/auth slices.
- Supabase access outside `api/` segments (client) or `api/queries.ts` (server)
  is forbidden.
- **No email confirmation, no email-based password recovery** (portfolio
  project — a reviewer shouldn't need a real inbox to try any auth flow).
  "Confirm email" (`mailer_autoconfirm`) and "Secure email change" are both
  **off** in the Supabase dashboard — `signUp` returns a live session and an
  email change applies immediately. There is deliberately no confirm/verify
  page and no `emailRedirectTo` on `signUp`. The forgot/reset-password flow
  (`resetPasswordForEmail`) was removed entirely rather than kept as a real
  emailed link, since letting anyone reset a password without proving inbox
  ownership would be a hole, not a shortcut — a signed-in user changes their
  password from the profile page instead (`ChangePasswordForm`, re-auth with
  the current password) — see above for what `auth/callback` does instead.
  These are dashboard-only settings — `supabase/config.toml` has no
  `[auth]` section, so **never run `supabase config push`**; it would
  overwrite the remote `site_url`, `uri_allow_list` and Google provider config
  with CLI defaults.
- **Admin role**: `profiles.role` (`user_role` enum, default `'user'`) —
  not a JWT custom claim, since that needs a dashboard Auth Hook and this
  project never runs `supabase config push`. RLS reads it through
  `public.is_admin()` (`SECURITY DEFINER`, so a policy on `profiles` calling it
  doesn't recurse through the policy it's evaluating). Admin-only writes
  (`admin_update_order_status`, and any future admin mutation) are
  `SECURITY DEFINER` RPCs that check `is_admin()` themselves, never a
  role-gated `UPDATE`/`INSERT` policy — RLS has no column granularity, and
  `orders`/`order_items` keep zero write policies by design (see
  `20260723071805_harden_order_write_paths.sql`). `profiles` also only grants
  `UPDATE` on specific columns (`username`, `first_name`, `last_name`,
  `avatar_url`, `updated_at`) to `anon`/`authenticated` — `role` is
  deliberately excluded, since a blanket `grant all` would let any user
  self-promote. The admin UI itself is a `/admin` branch (`AdminRoute` guard,
  `AdminLayout`) sibling to `MainLayout`, entered via a `ProfileNav` item shown
  only when `selectIsAdmin` is true. There's no signup path for admins — grant
  the role manually per the README.

## Database Schema & Migrations

Project is linked via Supabase CLI (`supabase link`); `DATABASE_URL` (pooler,
session mode) lives in `.env.local` — gitignored via `*.local`, never commit it.

- **Generated TS types:** `src/shared/api/database.types.ts` — the `Database`
  type (tables, views, enums, RPC signatures). Regenerate with
  `supabase gen types typescript --linked > src/shared/api/database.types.ts`.
- **Schema dump:** `supabase/schema.sql` — full `public` schema (tables, enums,
  RLS policies, functions, triggers). Read it as the source of truth for table
  shapes, constraints and RLS before writing any query. Refresh with
  `supabase db dump --schema public > supabase/schema.sql`.
- Both files are **generated** — never hand-edit them. They are snapshots: after
  any schema change, regenerate both in the same task so they stay in sync with
  the remote database.

**Hard rule — schema changes only through the CLI.** To alter the database
structure (tables, columns, enums, RLS policies, functions, triggers):

```bash
supabase migration new <descriptive_name>   # writes supabase/migrations/<ts>_<name>.sql
# edit that SQL file, then:
supabase db push
```

Never change the structure via the Supabase dashboard SQL editor, via
`psql`/`DATABASE_URL` DDL, or with ad-hoc SQL run outside a migration file —
that desyncs the repo from the database and the change is lost to review and
to other environments. `DATABASE_URL` is for **read-only inspection** only.

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
