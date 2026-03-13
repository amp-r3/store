<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=140&section=header&text=&fontSize=0" width="100%" />

<br/>

<h1>🛍️ Store</h1>

<p align="center">
  <em>A modern, feature-rich e-commerce storefront</em>
</p>

<br/>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&labelColor=0d0d1a" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=0d0d1a" />
  </a>
  <a href="https://redux-toolkit.js.org/">
    <img src="https://img.shields.io/badge/Redux_Toolkit-2.9-764ABC?style=flat-square&logo=redux&logoColor=white&labelColor=0d0d1a" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=0d0d1a" />
  </a>
  <a href="https://sass-lang.com/">
    <img src="https://img.shields.io/badge/SASS-Modules-CC6699?style=flat-square&logo=sass&logoColor=white&labelColor=0d0d1a" />
  </a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/🎨_Glassmorphism_UI-1a1a2e?style=flat-square&color=7c6dff" />
  <img src="https://img.shields.io/badge/🔍_Instant_Search-1a1a2e?style=flat-square&color=6d7cff" />
  <img src="https://img.shields.io/badge/📦_Redux_Cart-1a1a2e?style=flat-square&color=764abc" />
  <img src="https://img.shields.io/badge/📱_Responsive-1a1a2e?style=flat-square&color=5c6dff" />
  <img src="https://img.shields.io/badge/🌙_Dark_&_Light_Theme-1a1a2e?style=flat-square&color=3d4fff" />
  <img src="https://img.shields.io/badge/🗂️_Category_Filter-1a1a2e?style=flat-square&color=4d5fff" />
</p>

<br/>

> A fully responsive, dual-themed e-commerce UI with glassmorphism aesthetics, real-time search, category filtering, smart pagination, and a Redux-powered shopping cart with persistent storage — built as a portfolio project to demonstrate modern React architecture.

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

</div>

<br/>

## ✨ Features

| | Feature | Description |
|:---:|---|---|
| 🔍 | **Instant Product Search** | Instant URL-synced search powered by query params — results are always shareable and bookmarkable |
| 🗂️ | **Dynamic Product Catalog** | Paginated grid fetched from [DummyJSON](https://dummyjson.com) with normalized state via RTK Query |
| ↕️ | **Advanced Sorting** | Sort by popularity, price, name, or stock level — persisted in the URL |
| 🏷️ | **Category Filtering** | Filter products by 24 categories via an adaptive control — bottom sheet on mobile, popup on desktop — disabled during active search |
| 📄 | **Detailed Product Pages** | Routed pages (`/product/:id`) with full description, image, stock status, ratings, and reviews |
| 🛒 | **Redux Shopping Cart** | Client-side cart with add/remove, quantity controls, discount calculation, and free-shipping progress bar |
| 💾 | **Persistent Cart & Theme** | Cart items and selected theme are saved to `localStorage` via `redux-persist` — survive page refreshes |
| 🌙 | **Dark / Light Theme** | Toggle between deep dark-purple and clean light themes, persisted across sessions |
| 📱 | **Responsive & Mobile-First** | Adaptive layout for all screen sizes; mobile gets a floating search bar with hide-on-scroll behavior |
| 💎 | **Glassmorphism UI** | Dark & light themes built on a custom SCSS design token system with consistent spacing, shadows, and blur effects |
| ⚡ | **Performance Optimizations** | Lazy routes, memoized selectors via Reselect, normalized API cache, and image lazy loading |
| 📳 | **Haptic Feedback** | Vibration on key interactions powered by the `web-haptics` library for immersive tactile experience |

<br/>

## 🛠️ Tech Stack

<div align="center">

| Category | Technology |
|:---|:---|
| **UI Library** | React 19 |
| **Language** | TypeScript 5.9 |
| **State Management** | Redux Toolkit 2.9 + RTK Query |
| **Persistence** | redux-persist |
| **Routing** | React Router v7 |
| **Styling** | SCSS Modules + custom design tokens |
| **HTTP Client** | RTK Query base query |
| **Build Tool** | Vite 7 |
| **Data Source** | [DummyJSON API](https://dummyjson.com) |

</div>

<br/>

## 🏗️ Project Architecture

The project follows a **feature-based architecture** with clean separation of concerns:

```
src/
├── app/
│   ├── router.ts          # React Router v7 configuration with lazy routes
│   └── store.ts           # Redux store setup with redux-persist
│
├── components/
│   ├── cart/              # CartDrawer, CartItem, CartFooter, CartHeader, EmptyCart
│   ├── common/            # Loader, ErrorView, NoResults, SearchForm, ThemeToggle
│   ├── layout/            # Layout, Navbar, MobileBar, Footer
│   └── products/          # ProductCard, ControlPanel, Pagination
│                          #   └── ControlPanel/
│                          #       ├── SortControl/      # SortDropdown (desktop), SortBottomSheet (mobile)
│                          #       └── CategoryControl/  # CategoryPopup (desktop), CategoryOverlay (mobile)
│
├── hooks/                 # Custom hooks encapsulating business logic
│   ├── useProductCatalog  # Orchestrates fetching, sorting, pagination, category
│   ├── useProduct         # Single product fetch with RTK Query
│   ├── useSearch          # URL-synced search state
│   ├── useSort            # URL-synced sort, category. pagination state
│   ├── useTheme           # Redux-powered theme toggle with DOM class sync
│   ├── usePagination      # Smart pagination range with ellipsis logic
│   ├── useNavbarScroll    # Scroll-aware navbar class toggling
│   └── useMediaQuery      # Responsive breakpoint detection
│
├── pages/
│   ├── CatalogPage/       # Main product grid
│   ├── ProductPage/       # Individual product detail
│   └── Page404/           # Not found fallback
│
├── services/
│   └── productsApi.ts     # RTK Query API slice (getProducts, getProductById)
│
├── store/
│   ├── slices/
│   │   ├── cartSlice      # Cart state: items, open/close, quantity — persisted
│   │   └── themeSlice     # Theme state: 'theme-dark' | 'theme-light' — persisted
│   └── selectors/         # Memoized cart selectors (total, quantity, items)
│
├── styles/
│   ├── _variables.scss    # Full design token system
│   ├── _theme-dark.scss   # Deep dark-purple CSS custom properties
│   ├── _theme-light.scss  # Clean light CSS custom properties
│   ├── index.scss         # SCSS barrel file
│   └── main.scss          # Global resets & base styles
│
├── types/
│   └── products.ts        # TypeScript interfaces (Product, CartItem, Review…)
│
└── utils/
    ├── priceHelper        # applyDiscount, formatPrice
    ├── cartHelper         # calculateCartTotals (subtotal, discount, shipping)
    ├── sortingOptions     # Typed sorting config array
    ├── categoryOptions    # Typed category config array (24 categories + 'all')
    ├── hapticPresets      # Typed haptic presets object (11 different vibration presets)
    ├── getErrorMessage    # RTK Query error normalizer
    └── scrollToTop        # Scroll utility
```

### Key Architectural Decisions

**🔗 URL as the single source of truth for UI state** — search query (`?q=`), sort (`?sortBy=`, `?order=`), category (`?category=`), and page (`?page=`) are all URL params. Makes the app fully shareable and back/forward navigation works correctly out of the box.

**⚡ Normalized API cache** — RTK Query responses are transformed into `{ ids: number[], items: Record<id, Product> }` for O(1) lookups and clean re-renders.

**🧩 Custom hooks as the logic layer** — Components stay declarative and thin; all data fetching, URL manipulation, and derived state live in dedicated hooks.

**💾 Selective persistence via redux-persist** — Only `cart.items` and `theme.theme` are whitelisted for `localStorage` storage. RTK Query cache and transient UI state (e.g. `isOpen`) are intentionally excluded.

**🌗 CSS-class-based theming** — The active theme class (`theme-dark` / `theme-light`) is applied to `<html>` by `useTheme`, which keeps theme switching decoupled from component tree re-renders. All visual tokens are defined as CSS custom properties per theme in dedicated SCSS files.

**🎨 SCSS design token system** — All colors, spacing, radius, shadows, transitions, and z-indexes are defined in `_variables.scss`, ensuring consistency and making visual changes a one-line update.

<br/>

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20`
- [pnpm](https://pnpm.io/) _(recommended)_ or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/amp-r3/store.git
cd store

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
pnpm dev        # Start dev server with HMR
pnpm build      # Type-check + production build
pnpm preview    # Preview the production build locally
pnpm lint       # Run ESLint
pnpm tsc        # Run TypeScript type checking only
```

<br/>

## 📐 Design System

The UI is built on a custom SCSS token system covering every visual dimension:

<div align="center">

| Token Category | Examples |
|:---|:---|
| **Colors** | `$primary-accent`, `$text-primary`, `$glass-background` |
| **Typography** | `$fs-sm` → `$fs-display` · `$fw-normal` → `$fw-black` |
| **Spacing** | `$spacing-xxs` (0.25rem) → `$spacing-xxl` (3rem) |
| **Border Radius** | `$radius-sm` (8px) → `$radius-pill` (999px) |
| **Shadows** | `$shadow-xs` → `$shadow-accent-hover` |
| **Transitions** | `$transition-fast` (200ms) → `$transition-smooth` (600ms) |
| **Easing** | `$ease-spring` · `$ease-out-expo` · `$ease-in-out-smooth` |
| **Z-Index** | Hierarchical from `$z-index-base` to `$z-index-toast` |

</div>

Both `theme-dark` and `theme-light` override the same set of CSS custom properties (`--primary-accent`, `--text-primary`, `--glass-background`, etc.), so every component automatically adapts to the active theme without conditional logic.

<br/>

## 🔌 API Integration

All data is sourced from the **[DummyJSON API](https://dummyjson.com)** — a free, public REST API for prototyping.

<div align="center">

| Endpoint | Usage |
|:---|:---|
| `GET /products` | Paginated catalog with sort support |
| `GET /products/search?q=` | Real-time search results |
| `GET /products/category/:slug` | Category-filtered product listing |
| `GET /products/:id` | Product detail page |

</div>

RTK Query handles caching, loading states, and deduplication automatically. Responses are normalized in `transformResponse` before hitting the Redux store. Category filtering and search are mutually exclusive at the API level — the `ControlPanel` disables the category button while a search query is active.

<br/>

## 📸 Screenshots

<div align="center">

| Catalog Page | Product Page |
|:---:|:---:|
| <img src="./docs/screenshots/catalog.png" width="440" /> | <img src="./docs/screenshots/product.png" width="440" /> |

| Shopping Cart |
|:---:|
| <img src="./docs/screenshots/cart.png" width="900" /> |

| Mobile View |
|:---:|
| <img src="./docs/screenshots/mobile-view.png" width="280" /> |

</div>

<br/>

## 🗺️ Roadmap

- [x] Dark / Light theme toggle with persistence
- [x] Product category filtering
- [x] Persistent cart via `localStorage`
- [ ] Wishlist / saved items feature
- [ ] Checkout flow (UI-only)
- [ ] Unit tests with Vitest + React Testing Library

<br/>

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

<sub>Made with ☕ and a lot of <code>git commit -m "ship it"</code></sub>

</div>