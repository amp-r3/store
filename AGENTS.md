# CLAUDE.md

Guidance for Claude Code in this repo. `CLAUDE.md` symlinks `AGENTS.md` — edit `AGENTS.md`.

## Stack & Commands

Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9, Redux Toolkit
2.9 + RTK Query, redux-persist (localStorage), Supabase (PostgreSQL + Auth
via `@supabase/ssr`), SCSS Modules + CSS custom properties, React Hook Form +
Zod. `pnpm dev`/`build`/`start`/`tsc`(`--noEmit`)/`lint`. **No test runner**
— verify via `pnpm tsc`, `pnpm lint`, manual exercise (curl for
server-rendered content; the user checks interactive behavior themselves).
Needs `.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL` (canonical/OG/sitemap URLs server-side, where
`window.location` isn't available — `shared/config/site.ts`).

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
```

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
hand-roll per call site).

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

`strict: true`, `noUnusedLocals`, `noUnusedParameters`. `any` only as a last
resort with a comment. Forms: Zod + `react-hook-form` via
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
`SUPABASE_IMAGE_HOST` — never hardcode the project ref; its
`isAllowedImageUrl()` backs `admin-product-form`'s `productSchema.ts` — keep
both in sync. `useMemo`/`useCallback`/`React.memo` as usual.

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

## Git Commits

English only, Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`,
`style:`, `test:`, `chore:`). One logical change per commit; keep dependent
cross-layer changes together. No dev-process noise, no `Co-Authored-By`
trailer; body only for large/complex changes.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
