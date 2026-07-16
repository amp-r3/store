<p align="right">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a>
</p>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=140&section=header&text=&fontSize=0" width="100%" />

<br/>

<h1>🛍️ Store — E-Commerce SPA</h1>

<p align="center">
  <em>Современный, премиальный и высокотехнологичный интернет-магазин</em>
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

> **Store** — это современное одностраничное веб-приложение (SPA) для
> электронной коммерции, построенное на базе связки **React 19**, **TypeScript
> 5.9** и **Redux Toolkit 2.9**. Приложение обладает уникальным премиальным
> дизайном в стиле **Glassmorphism**, премиальной лавандово-графитовой темой,
> синхронизацией состояния с URL, отзывчивой мобильной версией, тактильным
> откликом (Haptics) и мощной интеграцией с **Supabase** для аутентификации,
> хранения корзины, избранного и истории заказов.

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

</div>

<br/>

---

## 🏗️ Архитектура проекта (Feature-Sliced Design)

Проект спроектирован с использованием архитектурной методологии **Feature-Sliced Design (FSD)**, что обеспечивает строгую, предсказуемую и масштабируемую структуру. При этом сохраняется упор на строгое разделение ответственности, модульность и соответствие соглашениям (BEM, SCSS Modules).

```text
src/
├── app/            # Инициализация приложения, Redux Store, конфигурация роутера, глобальные стили
├── pages/          # Страницы приложения (CatalogPage, ProductPage, OrdersPage и др.)
├── widgets/        # Сложные самостоятельные UI-блоки из фич и сущностей (Header, CartDrawer)
├── features/       # Пользовательские взаимодействия и бизнес-действия (AddToCart, ThemeToggle)
├── entities/       # Бизнес-сущности и их отображение (Product, User, Order)
└── shared/         # Переиспользуемая инфраструктура, UI-kit, конфиги, типы, утилиты и API
```

### Ключевые архитектурные решения

1. **Feature-Sliced Design (FSD)**: Строгое следование принципам FSD.
   - **Однонаправленные зависимости**: `app` -> `pages` -> `widgets` -> `features` -> `entities` -> `shared`. Модули могут импортировать только из нижележащих слоев.
   - **Публичные API (Public API)**: Каждый слайс экспортирует свой интерфейс через `index.ts` (Barrel-файл). Внутренние кросс-импорты между слайсами запрещены.
2. **URL как единственный источник правды (Single Source of Truth) для
   каталога**: Параметры поиска (`?q=`), сортировка (`?sortBy=`, `?order=`),
   категория (`?category=`) и текущая страница (`?page=`) хранятся и управляются
   исключительно через URL (`useSearchParams`). Это позволяет делиться ссылками,
   сохранять их в закладки, а также обеспечивает корректную работу кнопок
   «Назад»/«Вперед» в браузере.
3. **Тонкие компоненты и вынесение логики в модели/хуки**: Все UI-компоненты декларативны.
   Запросы к API, манипуляции с роутером, вычисление производных состояний и
   валидация происходят в специализированных сегментах слайсов (`model`, `lib`, `api`).
4. **Нормализация кэша в RTK Query**: Ответы API от DummyJSON трансформируются в
   структуру `{ ids: number[], items: Record<number, Product> }` для O(1) поиска
   и снижения нагрузки на рендеринг.
5. **Селективное кэширование в LocalStorage (Redux Persist)**: В локальное
   хранилище записываются только самые важные данные: `cart.items`,
    `wishlistSlice` (для неавторизованных пользователей) и `auth`
    (пользователь и токен). Кэш запросов RTK Query и временное состояние UI не
    персистируются.
5. **Тематизация на основе CSS Custom Properties**: Оформление построено на
   единой системе CSS-переменных лавандово-графитовой темы. Использование
   переменных для стилей компонентов исключает лишние ререндеры дерева React.

---

## 💎 Главные фишки и особенности

- 🎨 **Премиальный дизайн в стиле Glassmorphism**: Тщательно подобранная
  цветовая палитра, размытие заднего плана (backdrop-filter), мягкие тени и
  плавные микро-анимации на основе физики пружин.
- 🎨 **Премиальная лавандово-графитовая тема**: Единый премиальный стиль,
  сочетающий глубокие графитовые оттенки с мягким лавандовым акцентом,
  обеспечивающий высокую эстетику и визуальный комфорт.
- ⚡ **Оптимистичные обновления (Optimistic Updates)**: При изменении количества
  товаров в корзине или переключении избранного интерфейс реагирует мгновенно.
  Изменения отправляются на сервер в фоновом режиме, а в случае сбоя состояние
  автоматически откатывается (`patchResult.undo()`).
- 📳 **Тактильный отклик (Haptic Feedback)**: Интеграция библиотеки
  `web-haptics` для приятной вибрации мобильного устройства при добавлении в
  корзину (`soft()`), изменении фильтров (`light()`) или успешном оформлении
  заказа (`success()`).
- 🚀 **Асинхронность и ленивая загрузка**: Все страницы (кроме главной
  `CatalogPage`) загружаются лениво через `React.lazy`. На время загрузки
  отображаются детализированные анимированные скелетоны
  (`react-loading-skeleton`), стилизованные под CSS-переменные темы.
- ⚙️ **Строгая методология BEM**: CSS-классы написаны строго по БEM
  (`block__element--modifier`), импортируются в JSX исключительно через
  типизированные SCSS Modules: `className={style['cart-item__btn--remove']}`.
- 🔄 **Двухэтапная синхронизация корзины и избранного**: Авторизованные
  пользователи работают с облачной базой Supabase. При входе в аккаунт локальная
  корзина и избранное из `localStorage` объединяются с серверными
  (merge-on-login), предотвращая потерю выбранных товаров.

---

## 🔌 Интеграция с Supabase (Требования к бэкенду)

Для полноценной работы фронтенда требуются настроенные сервисы Supabase Auth и
PostgreSQL база данных. Ниже описана необходимая структура таблиц, триггеры и
функции.

### 1. Таблицы базы данных

#### Таблица `profiles` (Профили пользователей)

Служит для хранения расширенных данных пользователей, связанных с `auth.users`.

```sql
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  username text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Политики безопасности:
alter table public.profiles enable row level security;
create policy "Allow public read access to profiles" on public.profiles for select using (true);
create policy "Allow users to update their own profiles" on public.profiles for update using (auth.uid() = id);
```

#### Автоматический триггер профиля

Для создания профиля при регистрации нового пользователя:

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

#### Таблица `cart_items` (Корзина пользователей)

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

#### Таблица `wishlist_items` (Избранное)

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

#### Таблица `delivery_methods` (Способы доставки)

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

#### Таблица `payment_methods` (Способы оплаты)

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

#### Таблица `orders` (Заказы)

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

#### Таблица `order_items` (Элементы заказа)

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

### 2. Хранимая функция (RPC) для оформления заказа

Фронтенд вызывает функцию `create_order` для безопасного транзакционного
создания заказа на сервере.

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

  -- 1. Генерация номера заказа ORD-YYYYMMDD-XXXX
  v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');

  -- 2. Получение параметров доставки
  select price, free_from_price into v_delivery_price, v_free_from
  from public.delivery_methods
  where id = p_delivery_method_id and is_active = true;

  -- 3. Получение параметров оплаты
  select fee_percentage, fee_fixed into v_payment_fee_pct, v_payment_fee_fix
  from public.payment_methods
  where id = p_payment_method_id and is_active = true;

  -- 4. Вставка заказа в таблицу orders
  -- Примечание: так как каталог товаров (DummyJSON) является внешним, 
  -- в демонстрационных целях расчет итоговой стоимости может осуществляться
  -- с учетом переданных параметров или вычисляться на клиенте.
  -- Для обеспечения надежности, создается запись с расчетом доставки и сборов:
  insert into public.orders (
    order_number, user_id, status, total_amount, shipping_address, 
    payment_status, delivery_status, delivery_method_id, delivery_cost, payment_fee
  ) values (
    v_order_number, v_user_id, 'pending', 0, p_shipping_address,
    'pending', 'pending', p_delivery_method_id, coalesce(v_delivery_price, 0), coalesce(v_payment_fee_fix, 0)
  ) returning id into v_order_id;

  -- 5. Добавление элементов заказа в order_items
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.order_items (order_id, product_id, quantity, price_at_purchase)
    values (
      v_order_id, 
      (v_item->>'product_id')::integer, 
      (v_item->>'quantity')::integer, 
      coalesce((v_item->>'price_at_purchase')::numeric, 99.99) -- Заглушка или переданная цена
    );
  end loop;

  -- Возвращаем номер заказа и его ID
  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number
  );
end;
$$ language plpgsql security definer;
```

---

## 🚦 Текущий статус и Дорожная карта (Roadmap)

### ✅ Что уже полностью сделано (Done)

- [x] **Архитектурный фундамент**: React 19, TS 5.9, Vite 8, LightningCSS, RTK
      Query.
- [x] **Система стилей**: SCSS Modules по BEM, переменные и уникальная
      лавандово-графитовая тема.
- [x] **Каталог товаров (SB DB)**: Поиск, фильтрация по категориям, пагинация,
      детальные страницы товаров, рейтинги. Скелетоны для загрузки.
- [x] **Интеграция Supabase Auth**: Регистрация, вход, изменение данных профиля,
      синхронизация сессии через `onAuthStateChange`.
- [x] **Корзина (Cart)**: Локальная персистенция, оптимистичные обновления,
      слияние локальной корзины с облачной при логине.
- [x] **Избранное (Wishlist)**: Синхронизация с Supabase, оптимистичные мутации.
- [x] **Оформление заказа (Checkout)**: Сбор адреса (Zod + React Hook Form),
      выбор доставки и оплаты, расчет комиссий.
- [x] **История заказов (Orders)**: Просмотр прошлых заказов с пагинацией и
      бесконечным скроллом, кастомные статусы и бейджи (SCSS mixins).
- [x] **Тактильная обратная связь**: Реализация библиотеки `web-haptics` для
      взаимодействия с интерфейсом.

### 🚀 Что предстоит сделать (Backlog / Future)

- [ ] **Смена архитектуры (Next.js)**: Перенос проекта на Next.js для
      полноценного SSR/SSG, оптимизации SEO и улучшения Core Web Vitals.
- [ ] **Система отзывов**: Возможность оставлять текстовые отзывы и ставить
      оценки к каждому товару (с привязкой к истории покупок, чтобы избежать
      накруток).
- [ ] **Слияние аккаунтов**: Поддержка Linking Identities в Supabase Auth
      (связывание нескольких провайдеров — Google, GitHub, Email — в одну
      учётную запись).
- [ ] **Интерактивные уведомления (Toast / Push)**: Система UI-оповещений о
      ключевых действиях (добавление/удаление из корзины, изменение статуса
      заказа).
- [ ] **Чат с поддержкой**: Интеграция онлайн-чата для связи с администрацией
      (например, через Supabase Realtime или сторонний виджет).
- [ ] **Административная панель**: Ролевая модель в Supabase (admin/customer)
      для управления доставкой товаров, изменением статусов заказов.
- [ ] **Локализация (i18n)**: Поддержка нескольких языков (Русский, Английский)
      с помощью `react-i18next`.
- [ ] **Unit- и интеграционное тестирование**: Добавление Vitest и React Testing
      Library для тестирования редьюсеров и кастомных хуков.
- [ ] **E2E тестирование**: Сценарии покупки и авторизации в Cypress или
      Playwright.

---

## 🚀 Быстрый старт

### Требования

- Node.js `>= 20`
- Пакетный менеджер **pnpm** (рекомендуется) или npm

### 1. Установка зависимостей

```bash
git clone https://github.com/amp-r3/store.git
cd store
pnpm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в корневом каталоге проекта:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Запуск dev-сервера

```bash
pnpm dev
```

Приложение запустится по адресу: `http://localhost:5173`

### 4. Доступные команды

- `pnpm dev` — запуск локального сервера разработки.
- `pnpm build` — сборка проекта для продакшена (проверка типов + Vite
  компиляция).
- `pnpm preview` — локальный запуск собранного бандла.
- `pnpm lint` — запуск линтера ESLint.
- `pnpm tsc` — компиляция и проверка типов TypeScript.

---

## 📸 Галерея интерфейса

<div align="center">

|                Главная страница (Каталог)                |                Детальная страница товара                 |
| :------------------------------------------------------: | :------------------------------------------------------: |
| <img src="./docs/screenshots/catalog.png" width="440" /> | <img src="./docs/screenshots/product.png" width="440" /> |

|                 Интерактивная Корзина                 |
| :---------------------------------------------------: |
| <img src="./docs/screenshots/cart.png" width="900" /> |

|                     Мобильный интерфейс                      |
| :----------------------------------------------------------: |
| <img src="./docs/screenshots/mobile-view.png" width="280" /> |

</div>

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,14,20,24&height=80&section=footer" width="100%" />

<sub>Сделано с ☕ и любовью к качественному коду.</sub>

</div>
