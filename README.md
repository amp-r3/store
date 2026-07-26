<p align="right">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

# 🛍️ Store — E-Commerce SPA

_A modern, premium, high-tech online store — portfolio project._

**Live demo:** [amp-r3-store.netlify.app](https://amp-r3-store.netlify.app/)

**Store** is a single-page e-commerce application built with **React 19**,
**TypeScript 5.9**, and **Redux Toolkit 2.9**. It features a premium
**Glassmorphism** design, a custom Lavender & Graphite theme, URL-synced
catalog state, a responsive mobile layout, haptic feedback, and deep
**Supabase** integration for authentication, cart persistence, wishlists, and
order history.

**Stack:** React 19 · TypeScript 5.9 · Redux Toolkit 2.9 + RTK Query ·
redux-persist · React Router v7 · Supabase (PostgreSQL + Auth) · SCSS Modules
· React Hook Form + Zod · Vite 8 + LightningCSS

---

## 🏗️ Project Architecture (Feature-Sliced Design)

The project is architected using the **Feature-Sliced Design (FSD)** methodology. This provides a strict, predictable, scalable structure, while maintaining a strong emphasis on separation of concerns, modularity, and adherence to naming conventions (BEM, SCSS Modules).

```text
src/
├── app/            # Application initialization, Redux store setup, router config, global styles
├── pages/          # Application pages (CatalogPage, ProductPage, OrdersPage, etc.)
├── widgets/        # Complex standalone UI blocks composed of entities and features (e.g., Header, CartDrawer)
├── features/       # User interactions and business actions (e.g., AddToCart, ThemeToggle)
├── entities/       # Business entities and their representations (Product, User, Order)
└── shared/         # Reusable infrastructure, UI kit, configs, types, utils, and base API
```

### Key Architectural Decisions

1. **Feature-Sliced Design (FSD)**: Strict adherence to FSD principles.
   - **Unidirectional dependencies**: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Modules only import from layers strictly below them.
   - **Public APIs**: Every slice exposes its capabilities via an `index.ts` barrel file. Internal cross-slice imports are forbidden.
2. **URL as the Single Source of Truth for the catalog**: Search query (`?q=`),
   sort order (`?sortBy=`, `?order=`), category (`?category=`), and current page
   (`?page=`) are all managed exclusively via URL (`useSearchParams`). This
   enables shareable and bookmarkable links, as well as correct browser
   Back/Forward navigation.
3. **Thin components with logic separated into models/hooks**: All UI components are declarative.
   API requests, router manipulation, derived state computation, and validation
   are handled inside dedicated slice segments (e.g., `model`, `lib`, `api`).
4. **Normalized cache in RTK Query**: API responses are transformed into a
   `{ ids: number[], items: Record<number, Product> }` structure for O(1)
   lookups and reduced rendering overhead.
5. **Selective LocalStorage caching (Redux Persist)**: Only the most critical
   data is persisted: `cart.items`, `wishlistSlice` (for unauthenticated users),
    and `auth` (user and token). RTK Query cache and transient UI
   state are not persisted.

---

## 💎 Key Features & Highlights

- 🎨 **Premium Glassmorphism & Lavender-Graphite Design**: A carefully curated Lavender & Graphite color palette,
  backdrop-filter blur, soft shadows, and smooth spring-physics-based
  micro-animations.
- ⚡ **Optimistic Updates**: When updating cart quantities or toggling wishlist
  items, the UI responds instantly. Changes are sent to the server in the
  background, and automatically rolled back (`patchResult.undo()`) on failure.
- 📳 **Haptic Feedback**: Integration with the `web-haptics` library for
  pleasant vibration on mobile when adding to cart (`soft()`), changing filters
  (`light()`), or completing a purchase (`success()`).
- 🚀 **Async & Lazy Loading**: All pages (except the main `CatalogPage`) are
  lazy-loaded via `React.lazy`. Detailed animated skeletons
  (`react-loading-skeleton`), styled with the theme's CSS variables, are
  shown during loading.
- ⚙️ **Strict BEM Methodology**: CSS classes are written strictly following BEM
  (`block__element--modifier`) and imported into JSX exclusively via typed SCSS
  Modules: `className={style['cart-item__btn--remove']}`.
- 🔄 **Two-stage Cart & Wishlist Sync**: Authenticated users work with the
  Supabase cloud database. On login, the local cart and wishlist from
  `localStorage` are merged with the server state (merge-on-login), preventing
  any loss of selected items.

---

## 🔌 Backend (Supabase)

Auth, product catalog, cart, wishlist, and orders are backed by a
**Supabase/PostgreSQL** schema secured end-to-end with **Row Level Security**:
each user can only read/write their own `cart_items`, `wishlist_items`, and
`orders` rows. Order placement goes through a single `create_order` RPC
(`SECURITY DEFINER`) that validates the caller, resolves delivery/payment fees
server-side, and inserts the order and its line items in one transaction —
so a checkout can't leave partial state on failure.

---

## 🔭 Planned Improvements

- **Next.js migration** for SSR/SSG and better Core Web Vitals
- **Product reviews** tied to purchase history
- **Toast/push notifications** for cart and order events
- **i18n** (Russian/English) via `react-i18next`
- **Unit/E2E tests** (Vitest + Testing Library, Playwright)

---

## 📸 UI Gallery

<div align="center">

  <div style="display: inline-block; margin: 10px; vertical-align: top;">
    <p>Catalog Page (Main)</p>
    <img src="./docs/screenshots/catalog.png" height="450" alt="Catalog Page" />
  </div>
  <div style="display: inline-block; margin: 10px; vertical-align: top;">
    <p>Mobile View</p>
    <img src="./docs/screenshots/mobile-view.png" height="450" alt="Mobile View" />
  </div>

  <br><br>

  <div style="display: inline-block; margin: 10px; vertical-align: top;">
    <p>Interactive Cart</p>
    <img src="./docs/screenshots/cart.png" height="450" alt="Interactive Cart" />
  </div>
  <div style="display: inline-block; margin: 10px; vertical-align: top;">
    <p>Product Detail Page</p>
    <img src="./docs/screenshots/product.png" height="450" alt="Product Detail Page" />
  </div>

</div>
