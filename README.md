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
    <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white&labelColor=0d0d1a" />
  </a>
  <a href="https://supabase.com/">
    <img src="https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white&labelColor=0d0d1a" />
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
  <img src="https://img.shields.io/badge/🔐_Supabase_Auth-1a1a2e?style=flat-square&color=3ecf8e" />
</p>

<br/>

> A fully responsive, dual-themed e-commerce UI with glassmorphism aesthetics, real-time search, category filtering, smart pagination, a Redux-powered shopping cart with persistent storage, and a complete authentication system powered by Supabase — built as a portfolio project to demonstrate modern React architecture.

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

</div>

<br/>

## ✨ Features

| | Feature | Description |
|:---:|---|---|
| 🔍 | **Instant Product Search** | URL-synced search powered by query params — results are always shareable and bookmarkable |
| 🗂️ | **Dynamic Product Catalog** | Paginated grid fetched from [DummyJSON](https://dummyjson.com) with normalized state via RTK Query |
| ↕️ | **Advanced Sorting** | Sort by popularity, price, name, or stock level — persisted in the URL |
| 🏷️ | **Category Filtering** | Filter products by 24 categories via an adaptive control — bottom sheet on mobile, popup on desktop |
| 📄 | **Detailed Product Pages** | Routed pages with full description, image viewer, stock status, ratings, and reviews |
| 🛒 | **Redux Shopping Cart** | Client-side cart with add/remove, quantity controls, discount calculation, and free-shipping progress bar |
| 💾 | **Persistent Cart & Theme** | Cart items and selected theme are saved to `localStorage` via `redux-persist` |
| 🌙 | **Dark / Light Theme** | Toggle between deep dark-purple and clean light themes, persisted across sessions |
| 🔐 | **Authentication** | Full sign-up and sign-in flow backed by Supabase Auth with protected routes |
| 👤 | **User Profile** | Personal account page with editable profile fields and secure logout |
| 📱 | **Responsive & Mobile-First** | Adaptive layout for all screen sizes; mobile gets a floating search bar with hide-on-scroll |
| 💎 | **Glassmorphism UI** | Dark & light themes built on a custom SCSS design token system with blur effects and consistent shadows |
| ⚡ | **Performance** | Lazy routes, memoized selectors via Reselect, normalized API cache, and image lazy loading |
| 📳 | **Haptic Feedback** | Vibration on key interactions via the `web-haptics` library |

<br/>

## 🔐 Authentication

The project includes a complete auth system built on **[Supabase](https://supabase.com)** (PostgreSQL + Auth):

- **Registration** — sign-up form with first name, last name, username, email, and password; validated with Zod + React Hook Form
- **Login** — email/password authentication via Supabase Auth
- **Protected routes** — the `/user` page is accessible only to authenticated users; unauthorized visitors are redirected to `/login`
- **Public routes** — `/login` and `/register` redirect authenticated users back to the catalog
- **Session persistence** — the auth token and user data are stored via `redux-persist`; the Supabase `onAuthStateChange` listener keeps Redux in sync with the real session state across tabs and page refreshes
- **Profile editing** — users can update their name, username, and email from the account page; the current password is required to confirm any changes
- **Logout** — confirmed via a modal dialog; clears both Redux state and the Supabase session

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
| **Backend / BaaS** | Supabase (PostgreSQL, Auth) |
| **Form Validation** | React Hook Form + Zod |
| **Build Tool** | Vite 8 |
| **Data Source** | [DummyJSON API](https://dummyjson.com) |

</div>

<br/>

## 🏗️ Project Architecture

The project follows a **feature-based architecture** with clean separation of concerns:

```
src/
├── app/          # Redux store setup and React Router configuration with lazy routes
├── components/   # Reusable UI components (cart drawer, product cards, navbar, modals, forms)
├── hooks/        # Custom hooks encapsulating business logic (search, filters, theme, haptics, auth)
├── pages/        # Page-level components (Catalog, Product, Login, Register, User, 404)
├── schemas/      # Zod validation schemas for all forms (login, register, edit profile)
├── services/     # RTK Query API slices — DummyJSON products API and Supabase auth API
├── store/        # Redux slices (cart, theme, auth) and memoized selectors
├── styles/       # Global SCSS — design tokens, dark/light theme CSS variables, resets
├── types/        # Shared TypeScript interfaces (Product, CartItem, Auth types)
└── utils/        # Pure helper functions (price formatting, cart totals, sorting options, haptic presets)
```

### Key Architectural Decisions

**🔗 URL as the single source of truth for UI state** — search query (`?q=`), sort (`?sortBy=`, `?order=`), category (`?category=`), and page (`?page=`) are all URL params. Makes the app fully shareable and back/forward navigation works correctly out of the box.

**⚡ Normalized API cache** — RTK Query responses are transformed into `{ ids: number[], items: Record<id, Product> }` for O(1) lookups and clean re-renders.

**🧩 Custom hooks as the logic layer** — components stay declarative and thin; all data fetching, URL manipulation, and derived state live in dedicated hooks.

**💾 Selective persistence via redux-persist** — only `cart.items`, `theme.theme`, and `auth` (user + token) are whitelisted for `localStorage`. RTK Query cache and transient UI state are intentionally excluded.

**🌗 CSS-class-based theming** — the active theme class (`theme-dark` / `theme-light`) is applied to `<html>` by `useTheme`, keeping theme switching decoupled from component tree re-renders. All visual tokens are CSS custom properties defined per theme in dedicated SCSS files.

**🔐 Auth session sync** — `Layout` subscribes to Supabase's `onAuthStateChange` and dispatches `setSession` / `logout` to Redux, so the client always reflects the real server-side session — even after a token refresh or sign-out in another tab.

<br/>

## 🚀 Getting Started

### Prerequisites

- Node.js `>= 20`
- [pnpm](https://pnpm.io/) *(recommended)* or npm
- A [Supabase](https://supabase.com) project (free tier is sufficient)

### Installation

```bash
# Clone the repository
git clone https://github.com/amp-r3/store.git
cd store

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env.local` file in the project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase dashboard under **Project Settings → API**.

### Running the Dev Server

```bash
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

Both `theme-dark` and `theme-light` override the same set of CSS custom properties, so every component automatically adapts to the active theme without conditional logic.

<br/>

## 🔌 API Integration

All product data is sourced from the **[DummyJSON API](https://dummyjson.com)** — a free, public REST API for prototyping.

<div align="center">

| Endpoint | Usage |
|:---|:---|
| `GET /products` | Paginated catalog with sort support |
| `GET /products/search?q=` | Real-time search results |
| `GET /products/category/:slug` | Category-filtered product listing |
| `GET /products/:id` | Product detail page |
| `GET /products/categories` | Category list for the filter panel |

</div>

RTK Query handles caching, loading states, and deduplication automatically. Responses are normalized in `transformResponse` before hitting the Redux store.

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
- [x] Supabase Auth — registration and login
- [x] Protected routes and user profile page
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
