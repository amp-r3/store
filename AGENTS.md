# GEMINI.md — Project Rules & Conventions

> This document describes the mandatory conventions for the **Store** project — an e-commerce SPA on React 19 + TypeScript + Redux Toolkit + Supabase. Follow these rules for any code changes or additions.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript 5.9 |
| State | Redux Toolkit 2.9 + RTK Query |
| Persistence | redux-persist (localStorage) |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL + Auth) |
| Styling | SCSS Modules + CSS custom properties |
| Forms | React Hook Form + Zod |
| Build | Vite 8 + LightningCSS |

---

## 2. Project Structure

```text
src/
├── app/            # store.ts, router.ts
├── components/     # Reusable components
│   ├── common/     # Atomic/universal
│   ├── cart/       # Cart
│   ├── products/   # Cards, filters, pagination
│   └── layout/     # Header, Navbar, Footer, Layout wrappers
├── hooks/
│   ├── common/     # useTheme, useHaptics, usePagination …
│   └── features/   # cart/, checkout/, order/, product/, wishlist/, auth/
├── pages/          # Pages (CatalogPage, ProductPage …)
├── schemas/        # Zod schemas for forms
├── services/       # RTK Query API slices (productsApi, cartApi …)
├── store/          # Redux slices + selectors
├── styles/         # Global tokens, themes, main.scss
├── types/          # Common TypeScript interfaces
└── utils/          # Pure utility functions
```

**Rule:** A new functional block is always created following the same structure — component + SCSS module + barrel export.

---

## 3. CSS Class Naming — strictly BEM

All classes are written according to the BEM methodology: `block__element--modifier`.

```scss
// ✅ Correct
.cart-item { … }
.cart-item__title { … }
.cart-item__btn--remove { … }

// ❌ Incorrect
.cartItemTitle { … }
.item-title { … }
.removeBtn { … }
```

In TSX files — only via style object with string notation:

```tsx
// ✅ Correct
<div className={style['cart-item__btn--remove']}>

// ✅ Also acceptable (if there is no modifier)
<div className={style.card}>

// ❌ Incorrect — never write string classes directly
<div className="cart-item__btn--remove">
```

---

## 4. SCSS Modules — mandatory rules

### 4.1 Each component has its own module

The styles file is located next to the component:

```text
CartItem/
├── CartItem.tsx
└── cart-item.module.scss      ← kebab-case, matches the block name
```

### 4.2 Token imports — only via `@use`

All style tokens are imported via `@use '@/styles/index' as *`. No direct `@import` allowed.

```scss
// ✅ Correct
@use '@/styles/index' as *;

// ❌ Incorrect
@import '../../styles/variables';
```

### 4.3 Variable tokens — no hardcoded values

It is forbidden to write "magic" values directly. Always use tokens from `_variables.scss`:

```scss
// ✅ Correct
padding: $spacing-md;
border-radius: $radius-lg;
font-size: $fs-base;
transition: all $transition-base $ease-out-expo;

// ❌ Incorrect
padding: 16px;
border-radius: 18px;
font-size: 1rem;
transition: all 0.28s cubic-bezier(…);
```

### 4.4 Colors — only via theme CSS custom properties

Never hardcode colors. Always take them from CSS custom properties defined in `_theme-dark.scss` and `_theme-light.scss`:

```scss
// ✅ Correct
color: var(--text-primary);
background: var(--background-component);
border: 1px solid var(--border-color);
box-shadow: var(--shadow-default);

// ❌ Incorrect
color: #e8e6f5;
background: #121026;
border: 1px solid rgba(124, 109, 255, 0.24);
```

When using `rgba()` with an accent color, use `rgb` variables:

```scss
// ✅ Correct
background: rgba(var(--primary-accent-rgb), 0.08);

// ❌ Incorrect
background: rgba(124, 109, 255, 0.08);
```

### 4.5 Available CSS custom properties (reference)

**Accent:** `--primary-accent`, `--primary-accent-rgb`, `--primary-accent-dark`, `--primary-accent-light`

**Text:** `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`

**Background:** `--background-body`, `--background-component`, `--background-glass-base`, `--background-image-holder`

**Borders:** `--border-color-subtle`, `--border-color-light`, `--border-color`, `--border-color-strong`

**Shadows:** `--shadow-xs`, `--shadow-sm`, `--shadow-default`, `--shadow-card`, `--shadow-accent`, `--shadow-accent-sm`, `--shadow-accent-hover`

**Glassmorphism:** `--glass-background`, `--glass-background-subtle`, `--glass-background-strong`, `--glass-border`

**Semantics:** `--error-color`, `--success-color`, `--rating-color`

**Skeleton:** `--skeleton-base`, `--skeleton-highlight`

**Focus:** `--focus-ring-color`, `--shadow-focus-input`, `--shadow-focus-button`

### 4.6 Responsive — via `@media`, without separate files

Media queries are written inside the same SCSS module. Base project breakpoints: `480px`, `525px`, `549px`, `600px`, `640px`, `768px`, `1024px`, `1440px`.

### 4.7 Animations — via `@keyframes` inside the module

Each `@keyframes` is declared in the module where it is used. Animation timings — only via tokens (`$transition-base`, `$transition-layout`, `$ease-out-expo`, etc.).

### 4.8 `prefers-reduced-motion` — mandatory for animations

Any component with animations must respect system settings:

```scss
@media (prefers-reduced-motion: reduce) {
  .my-element {
    transition: none;
    animation: none;
  }
}
```

---

## 5. Barrel exports (`index.ts`)

### 5.1 Rule: always maintain an up-to-date `index.ts`

When adding a new component, hook, or utility — it is **mandatory** to add an export to the nearest `index.ts`.

```ts
// src/components/common/index.ts
export { MyNewComponent } from './MyNewComponent/MyNewComponent'
```

### 5.2 Where `index.ts` is mandatory

- `src/components/common/index.ts`
- `src/components/cart/index.ts`
- `src/components/products/index.ts`
- `src/hooks/index.ts`
- `src/hooks/common/index.ts`
- `src/hooks/features/*/index.ts` (each feature folder)
- `src/store/index.ts`
- `src/utils/index.ts`
- `src/config/index.ts`

### 5.3 Where `index.ts` is NOT needed (exceptions)

- `src/pages/` — pages are imported directly via `lazy()` in `router.ts`, exception: `src/pages/index.ts` exports only `CatalogPage` (not lazy)
- Internal page subfolders (`pages/CheckoutPage/components/…`)
- `src/services/` — each API file is imported directly
- `src/schemas/` — schemas are imported directly into the required components

---

## 6. Components

### 6.1 Component file structure

```text
ComponentName/
├── ComponentName.tsx          # Component
├── ComponentNameSkeleton.tsx  # Skeleton (if needed)
├── component-name.module.scss # Styles (kebab-case)
└── components/                # Nested sub-components (optional)
```

### 6.2 Skeleton components are mandatory for async data

Every component displaying data from an API must have a `*Skeleton` variant via `react-loading-skeleton`. Skeleton colors — via CSS custom properties:

```tsx
<Skeleton
  baseColor="var(--skeleton-base)"
  highlightColor="var(--skeleton-highlight)"
/>
```

### 6.3 `memo` for components in lists

Components rendering in a list (cards, rows) should be wrapped in `React.memo`:

```tsx
export const CartItem = memo<CartItemProps>(({ … }) => { … });
CartItem.displayName = 'CartItem';
```

### 6.4 Modal windows — via `#modal-root`

All portals (Drawer, Dialog, Dropdown) are mounted to `document.getElementById('modal-root')`.

```tsx
<Dialog.Portal container={document.getElementById('modal-root')!}>
```

### 6.5 No HTML `<form>` in React Artifacts/components with RTK

Use standard event handlers (`onClick`, `onChange`). The exception is native `<form>` with `onSubmit` in CheckoutPage/LoginPage/RegisterPage pages.

---

## 7. Hooks

### 7.1 Logic in hooks, components are declarative

All data fetching logic, URL manipulations, and computed states live in custom hooks. Components receive only ready-to-use data and callbacks.

### 7.2 Feature hooks structure

```text
hooks/features/cart/
├── useCartActions.ts   # Mutations (inc, dec, remove, clear)
├── useCartDetails.ts   # Data (items, totals, loading)
└── index.ts            # barrel
```

### 7.3 Redux — only via typed helpers

```ts
// ✅ Correct
const dispatch = useAppDispatch();
const value = useAppSelector(selectSomething);

// ❌ Incorrect
const dispatch = useDispatch();
const value = useSelector((state: any) => state.something);
```

---

## 8. State Management

### 8.1 URL — source of truth for catalog UI state

Search (`?q=`), sorting (`?sortBy=`, `?order=`), category (`?category=`), and page (`?page=`) — only in the URL via `useSearchParams`. Do not store in Redux.

### 8.2 What is stored in Redux (redux-persist)

| Slice | Whitelist |
|---|---|
| `cart` | `items` |
| `theme` | `theme` |
| `auth` | `user`, `token` |
| `wishlist` | `favoriteItems` |

RTK Query cache and transient UI state (isOpen, etc.) are **not persisted**.

### 8.3 Optimistic updates for cart and wishlist mutations

On mutations (`upsertCartItem`, `toggleWishlist`) — always use `onQueryStarted` + `updateQueryData` to immediately update the UI with `patchResult.undo()` on error.

### 8.4 Selectors — via `createSelector` (Reselect)

For performant computations from the Redux store, always use memoized selectors:

```ts
export const selectCartItemsArray = createSelector(
  [selectCartItemsMap],
  (itemsMap): CartProduct[] => Object.entries(itemsMap).map(…)
);
```

---

## 9. RTK Query / Services

### 9.1 All Supabase requests — via RTK Query

No direct `supabase.*` calls in components or hooks. Only via `queryFn` in `createApi`.

### 9.2 `fakeBaseQuery()` for Supabase

All API slices use `fakeBaseQuery()`, requests are implemented via `queryFn`.

### 9.3 `transformResponse` / normalization

API responses are normalized in `queryFn` before returning:

```ts
// Example: products → { items: Record<number, Product>, ids: number[], total: number }
const items = data.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {});
```

### 9.4 Cache tags for invalidation

Each API slice declares `tagTypes` and uses `providesTags` / `invalidatesTags` for correct cache invalidation.

---

## 10. Typing

### 10.1 Strict TypeScript — `strict: true`

The `tsconfig.json` file includes `"strict": true`, `"noUnusedLocals": true`, `"noUnusedParameters": true`. The `any` type — only as a last resort with a comment.

### 10.2 Types in `src/types/`

Common interfaces (`Product`, `CartItem`, `Order`, `SessionUser`, etc.) are stored in `src/types/`. Local types (only for a single component) — are declared in the file itself.

### 10.3 Zod for form validation

All forms are validated via Zod schemas from `src/schemas/`. Schemas are used together with `react-hook-form` via `@hookform/resolvers/zod`.

```ts
const form = useForm<MySchema>({ resolver: zodResolver(mySchema) });
```

---

## 11. Routing

### 11.1 Lazy imports for all pages except CatalogPage

```ts
// ✅ Correct
{
  path: 'product/:id',
  lazy: async () => {
    const { ProductPage } = await import('@/pages/ProductPage/ProductPage');
    return { Component: ProductPage };
  }
}
```

`CatalogPage` is the only exception (not lazy, imported directly for instant loading of the main page).

### 11.2 Protected and public routes

- `ProtectedRoute` — wrapper for `/user`, `/orders`. Redirects to `/login` if there is no auth.
- `PublicRoute` — wrapper for `/login`, `/register`. Redirects to `/` if auth is present.
- `CheckoutGuard` — checks for auth + non-empty cart.

---

## 12. Authentication (Supabase Auth)

### 12.1 Session synchronization — via `useAuthSync`

`useAuthSync` subscribes to `supabase.auth.onAuthStateChange` and synchronizes the Redux store. Called in `RootLayout` and `MainLayout`.

### 12.2 On sign in — sync local data with the server

On the `SIGNED_IN` event, the local cart and wishlist (from localStorage) are merged with the server ones via `syncCart` / `syncWishlist`, after which the local data is cleared.

### 12.3 On sign out — full clear

On `SIGNED_OUT` — RTK Query cache (`cartApi`, `wishlistApi`), cart and wishlist Redux slices, and the auth slice are reset.

---

## 13. Theming

### 13.1 Theme switching — via CSS class on `<html>`

The active theme (`theme-dark` / `theme-light`) is applied as a class on `document.documentElement`. Components do not know about the current theme.

### 13.2 `useTheme` — the only way to work with themes

```ts
const { theme, toggleTheme, setTheme } = useTheme();
```

### 13.3 No conditional styles based on theme in JS

```tsx
// ❌ Incorrect
const bg = theme === 'theme-dark' ? '#121026' : '#ffffff';

// ✅ Correct — via CSS custom properties, changes automatically
background: var(--background-component);
```

Exception in SCSS — using `:global(.theme-light)` or `:global(.theme-dark)` for specific cases:

```scss
:global(.theme-dark) .card__category {
  background-color: var(--border-color);
}
```

---

## 14. Performance

### 14.1 Lazy routes — mandatory

All pages except `CatalogPage` are loaded lazily via `lazy()` in `router.ts`.

### 14.2 Image loading

- First 8 cards on the page: `loading="eager"`, `fetchPriority="high"`
- The rest: `loading="lazy"`, `decoding="async"`, `fetchPriority="low"`

### 14.3 Memoization

- `useMemo` — for expensive computations (totals, normalized data)
- `useCallback` — for callbacks passed to child components
- `React.memo` — for components in lists
- `createSelector` — for Redux selectors

### 14.4 Optimistic updates

All cart and wishlist mutations use optimistic updates — the UI reacts instantly, without waiting for the server.

---

## 15. Accessibility (a11y)

### 15.1 Semantics

- Use `<article>` for product cards and order rows
- Use `<header>`, `<footer>`, `<nav>`, `<main>`, `<section>` as intended
- Hidden elements for screen readers — via the `.sr-only` class

### 15.2 ARIA

- Buttons without text — with `aria-label`
- Quantity counters — `<span className={style.srOnly}>N items in cart</span>`
- Live regions — `aria-live="polite"` for dynamic content

### 15.3 Focus

- Custom focus styles via `--focus-ring-color` and `--shadow-focus-button`
- Never remove `:focus-visible` without providing an alternative indicator

### 15.4 Touch targets

- Minimum size of an interactive element: `$touch-target-min` (44px)
- Comfortable: `$touch-target-comfortable` (48px)

---

## 16. Haptics

Tactile feedback via `useHaptics()` from `web-haptics`. Apply when:

- Opening/closing the cart → `soft()`
- Changing filters/sorting → `light()`
- Navigating links/cards → `soft()`
- Submitting forms / confirming → `success()`

```ts
const { soft, light, success } = useHaptics();
```

---

## 17. Status badges (orders)

For order, payment, and delivery statuses — use only SCSS mixins from `src/styles/_statuses.scss`:

```scss
@use '@/styles/statuses' as status;

.my-badge {
  @include status.badge-base;
  @include status.generate-modifiers;
}
```

The modifier is added dynamically via `data-status` or a `--${status}` class.

---

## 18. Forbidden patterns

| ❌ Forbidden | ✅ Alternative |
|---|---|
| Hardcoded colors in SCSS | CSS custom properties from themes |
| Hardcoded margins/sizes | SCSS tokens from `_variables.scss` |
| `any` in TypeScript | Specific type or `unknown` |
| Direct `supabase.*` calls in components | RTK Query via `queryFn` |
| `useDispatch()` / `useSelector()` directly | `useAppDispatch()` / `useAppSelector()` |
| Storing catalog UI filters in Redux | URL params via `useSearchParams` |
| HTML `<form>` in pure React components | `onSubmit` only in page components |
| Importing components without barrel | Via `index.ts` |
| String CSS classes directly in JSX | `style['block__element--modifier']` |
| `localStorage` directly | Via `redux-persist` + `storage.ts` |

---

## 19. Git Commit Conventions

All commits must follow these rules to maintain a clean and professional history:

### 19.1 Language and Style
- **Language:** English only.
- **Format:** [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `refactor:`, `docs:`, `style:`, `test:`, `chore:`).

### 19.2 Atomic and Complete Changes
- **Single Responsibility:** One commit = one logical change.
- **Integrity:** Commits must be independent. If a change in the API requires updates in components, include both in a single commit to ensure the project remains functional at every point in history.

### 19.3 Message Content
- **Descriptive:** Describe the change relative to the initial state (what exactly was added/changed).
- **No Noise:** Do not include "junk" information about errors encountered during development or transient steps.
- **Body:** Use the commit body only for large changes where the summary is insufficient to explain the impact.

### 19.4 Pre-commit Analysis
- Always analyze `git status` and the actual diff before writing the message.
- If unsure about the exact scope or impact of the change, stop and clarify.