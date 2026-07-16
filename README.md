<p align="right">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=140&section=header&text=&fontSize=0" width="100%" />

<br/>

<h1>🛍️ Store — E-Commerce SPA</h1>

<p align="center">
  <em>A modern, premium, and high-tech online store</em>
</p>

<br/>

<p align="center">
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React_19-0d0d1a?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript_5.9-0d0d1a?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript" />
  </a>
  <a href="https://redux-toolkit.js.org/">
    <img src="https://img.shields.io/badge/Redux_Toolkit_2.9-0d0d1a?style=for-the-badge&logo=redux&logoColor=764ABC" alt="Redux Toolkit" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite_8-0d0d1a?style=for-the-badge&logo=vite&logoColor=646CFF" alt="Vite" />
  </a>
  <a href="https://supabase.com/">
    <img src="https://img.shields.io/badge/Supabase_Auth_&_DB-0d0d1a?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  </a>
  <a href="https://sass-lang.com/">
    <img src="https://img.shields.io/badge/SASS_Modules-0d0d1a?style=for-the-badge&logo=sass&logoColor=CC6699" alt="SASS" />
  </a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/🎨_Glassmorphism_UI-7c6dff?style=for-the-badge&color=1a1a2e&logoColor=white" alt="Glassmorphism UI" />
  <img src="https://img.shields.io/badge/🔍_Instant_Search-6d7cff?style=for-the-badge&color=1a1a2e&logoColor=white" alt="Real-time Search" />
  <img src="https://img.shields.io/badge/📦_Redux_Cart-764abc?style=for-the-badge&color=1a1a2e&logoColor=white" alt="Redux Cart" />
  <img src="https://img.shields.io/badge/📱_Responsive-5c6dff?style=for-the-badge&color=1a1a2e&logoColor=white" alt="Responsive" />
  <img src="https://img.shields.io/badge/🎨_Lavender_&_Graphite_Theme-b8a7f0?style=for-the-badge&color=17171c&logoColor=white" alt="Lavender and Graphite Theme" />
  <img src="https://img.shields.io/badge/⚡_Vite_8_+_LightningCSS-25a4ff?style=for-the-badge&color=1a1a2e&logoColor=white" alt="Vite and LightningCSS" />
</p>

<br/>

> **Store** is a modern single-page application (SPA) for e-commerce, built on
> top of **React 19**, **TypeScript 5.9**, and **Redux Toolkit 2.9**. The app
> features a unique premium **Glassmorphism** design, custom **Lavender & Graphite** theme,
> URL-synced state, a responsive mobile layout, haptic feedback, and
> deep **Supabase** integration for authentication, cart persistence, wishlists,
> and order history.

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

</div>

<br/>

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
4. **Normalized cache in RTK Query**: API responses from DummyJSON are
   transformed into a `{ ids: number[], items: Record<number, Product> }`
   structure for O(1) lookups and reduced rendering overhead.
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

## 🔌 Supabase Integration (Backend Requirements)

Full functionality requires configured Supabase Auth and a PostgreSQL database.
Below is the required table structure, triggers, and functions.

### 1. Database Tables

#### `profiles` Table (User Profiles)

Stores extended user data linked to `auth.users`.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Security Policies:
alter table public.profiles enable row level security;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profiles" on public.profiles for update using (auth.uid() = id);
```

#### Automatic Profile Trigger

Creates a profile automatically when a new user registers:

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'firstName', ''),
    coalesce(new.raw_user_meta_data->>'lastName', ''),
    coalesce(new.raw_user_meta_data->>'username', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### `cart_items` Table (User Cart)

```sql
create table public.cart_items (
  user_id uuid references auth.users on delete cascade not null,
  product_id integer not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, product_id)
);

alter table public.cart_items enable row level security;
create policy "Users can manage their own cart items" on public.cart_items for all using (auth.uid() = user_id);
```

#### `wishlist_items` Table (Favorites)

```sql
create table public.wishlist_items (
  user_id uuid references auth.users on delete cascade not null,
  product_id integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, product_id)
);

alter table public.wishlist_items enable row level security;
create policy "Users can manage their own wishlist items" on public.wishlist_items for all using (auth.uid() = user_id);
```

#### `delivery_methods` Table (Shipping Methods)

```sql
create table public.delivery_methods (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  price numeric not null,
  estimated_time text not null,
  is_active boolean default true not null,
  free_from_price numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.delivery_methods enable row level security;
create policy "Allow public read access to delivery methods" on public.delivery_methods for select using (true);
```

#### `payment_methods` Table (Payment Methods)

```sql
create table public.payment_methods (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  name text not null,
  fee_percentage numeric not null default 0,
  fee_fixed numeric not null default 0,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.payment_methods enable row level security;
create policy "Allow public read access to payment methods" on public.payment_methods for select using (true);
```

#### `orders` Table (Orders)

```sql
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text unique not null,
  user_id uuid references auth.users on delete cascade not null,
  status text not null default 'pending',
  total_amount numeric not null,
  shipping_address jsonb not null,
  payment_status text not null default 'pending',
  delivery_status text not null default 'pending',
  delivery_method_id uuid references public.delivery_methods on delete set null,
  delivery_cost numeric not null default 0,
  payment_fee numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;
create policy "Users can view their own orders" on public.orders for select using (auth.uid() = user_id);
```

#### `order_items` Table (Order Line Items)

```sql
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders on delete cascade not null,
  product_id integer not null,
  quantity integer not null check (quantity > 0),
  price_at_purchase numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.order_items enable row level security;
create policy "Users can view their own order items" on public.order_items for select 
using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));
```

### 2. Stored Function (RPC) for Order Placement

The frontend calls the `create_order` function to securely create an order on
the server within a single transaction.

```sql
create or replace function public.create_order(
  p_shipping_address jsonb,
  p_payment_method_id uuid,
  p_delivery_method_id uuid,
  p_items jsonb
)
returns jsonb as $$
declare
  v_user_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_delivery_cost numeric := 0;
  v_payment_fee numeric := 0;
  v_total_amount numeric := 0;
  v_item json;
  v_payment_fee_pct numeric := 0;
  v_payment_fee_fix numeric := 0;
  v_free_from numeric;
  v_delivery_price numeric;
  v_response jsonb;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  -- 1. Generate order number ORD-YYYYMMDD-XXXX
  v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  -- 2. Fetch delivery method parameters
  select price, free_from_price into v_delivery_price, v_free_from
  from public.delivery_methods
  where id = p_delivery_method_id and is_active = true;

  -- 3. Fetch payment method parameters
  select fee_percentage, fee_fixed into v_payment_fee_pct, v_payment_fee_fix
  from public.payment_methods
  where id = p_payment_method_id and is_active = true;

  -- 4. Insert order into the orders table
  -- Note: since the product catalog (DummyJSON) is external,
  -- for demonstration purposes the total cost calculation may use
  -- the passed parameters or be computed client-side.
  -- For reliability, the record is created with delivery and fee calculations:
  insert into public.orders (
    order_number, user_id, status, total_amount, shipping_address, 
    payment_status, delivery_status, delivery_method_id, delivery_cost, payment_fee
  ) values (
    v_order_number, v_user_id, 'pending', 0, p_shipping_address,
    'pending', 'pending', p_delivery_method_id, coalesce(v_delivery_price, 0), coalesce(v_payment_fee_fix, 0)
  ) returning id into v_order_id;

  -- 5. Insert line items into order_items
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.order_items (order_id, product_id, quantity, price_at_purchase)
    values (
      v_order_id, 
      (v_item->>'product_id')::integer, 
      (v_item->>'quantity')::integer, 
      coalesce((v_item->>'price_at_purchase')::numeric, 99.99) -- Fallback or passed price
    );
  end loop;

  -- Return the order number and its ID
  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number
  );
end;
$$ language plpgsql security definer;
```

---

## 🚦 Current Status & Roadmap

### ✅ Completed (Done)

- [x] **Architectural foundation**: React 19, TS 5.9, Vite 8, LightningCSS, RTK
      Query.
- [x] **Style system**: SCSS Modules following BEM, variables, and custom
      Lavender & Graphite theme.
- [x] **Product catalog (SB DB)**: Search, category filtering, pagination,
      product detail pages, ratings. Loading skeletons.
- [x] **Supabase Auth integration**: Registration, login, profile editing,
      session sync via `onAuthStateChange`.
- [x] **Cart**: Local persistence, optimistic updates, merge of local cart with
      cloud on login.
- [x] **Wishlist**: Supabase sync, optimistic mutations.
- [x] **Checkout**: Address collection (Zod + React Hook Form), delivery and
      payment method selection, fee calculation.
- [x] **Order history**: Browsing past orders with pagination and infinite
      scroll, custom statuses and badges (SCSS mixins).
- [x] **Haptic feedback**: `web-haptics` library integration for UI
      interactions.

### 🚀 Upcoming (Backlog / Future)

- [ ] **Architecture migration (Next.js)**: Move the project to Next.js for full
      SSR/SSG, SEO optimization, and improved Core Web Vitals.
- [ ] **Review system**: Allow users to leave text reviews and ratings for each
      product (linked to purchase history to prevent abuse).
- [ ] **Account linking**: Support for Linking Identities in Supabase Auth
      (connecting multiple providers — Google, GitHub, Email — into one
      account).
- [ ] **Interactive notifications (Toast / Push)**: UI notification system for
      key actions (add/remove from cart, order status updates).
- [ ] **Support chat**: Integration of a live chat widget for contacting
      administrators (e.g. via Supabase Realtime or a third-party widget).
- [ ] **Admin panel**: Role-based access model in Supabase (admin/customer) for
      managing order statuses and deliveries.
- [ ] **Localization (i18n)**: Multi-language support (Russian, English) using
      `react-i18next`.
- [ ] **Unit & integration testing**: Adding Vitest and React Testing Library
      for testing reducers and custom hooks.
- [ ] **E2E testing**: Purchase and authentication scenarios in Cypress or
      Playwright.

---

## 🚀 Quick Start

### Requirements

- Node.js `>= 20`
- Package manager **pnpm** (recommended) or npm

### 1. Install Dependencies

```bash
git clone https://github.com/amp-r3/store.git
cd store
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start the Dev Server

```bash
pnpm dev
```

The app will be available at: `http://localhost:5173`

### 4. Available Commands

- `pnpm dev` — start the local development server.
- `pnpm build` — build for production (type check + Vite compile).
- `pnpm preview` — locally serve the production build.
- `pnpm lint` — run the ESLint linter.
- `pnpm tsc` — compile and type-check with TypeScript.

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

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

<sub>Made with ☕ and a love for quality code.</sub>

</div>
