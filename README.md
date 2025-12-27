# Store: A Modern React E-Commerce Storefront

**Store** is a feature-rich, responsive e-commerce application built with the latest web technologies. It provides a seamless and modern user experience for browsing, searching, and sorting products, complete with a fully functional (client-side) shopping cart.

The application is built using **React 19**, **Vite**, and **Redux Toolkit**, and it fetches all product data from the public `dummyjson.com` API.

## ✨ Features

-   **Dynamic Product Catalog:** Displays a paginated grid of products fetched from the API.
-   **Advanced Sorting:** Sort the product catalog by popularity, price (ascending/descending), name (A-Z), and stock level.
-   **Real-time Product Search:** A global search bar in the navbar instantly filters products, providing a "search results" view.
-   **Detailed Product Pages:** A unique, routed page for each product (`/product/:id`) showing detailed descriptions, image galleries, stock, and user reviews.
-   **Redux-Powered Shopping Cart:** A fully functional client-side shopping cart managed by Redux Toolkit. Users can add, remove, and update item quantities.
-   **Responsive & Modern UI:** A mobile-first design that adapts to all screen sizes. The UI is built with a custom SASS/SCSS design token system and features modern "glassmorphism" effects.
-   **Custom Hooks:** Business logic is cleanly abstracted into custom hooks (e.g., `useProductCatalog`, `useProduct`, `useSearch`, `usePagination`) for reusability and clean components.
-   **Graceful API Handling:** Handles API loading, error, and "no results" states with dedicated `Loader`, `ErrorView`, and `NoResults` components to ensure a good user experience.

## 🛠 Tech Stack & Architecture

### Core Technologies

-   **React 19**
-   **Vite** (Build Tool)
-   **Redux Toolkit** (State Management)
-   **React Router v7** (Client-side Routing)
-   **SASS/SCSS Modules** (Styling)
-   **Axios** (HTTP Client)
-   **Reselect** (Memoized Selectors)

### Project Architecture

The project follows a clean, feature-based architecture that separates concerns effectively:

-   **/src/features**: Contains the core business logic, split into `products` and `cart`. Each feature folder contains its own `store` (Redux slice), `api` calls, and React `components`.
-   **/src/pages**: Holds the top-level page components (`CatalogPage`, `ProductPage`, `Page404`) which assemble features and UI components.
-   **/src/components**: Contains reusable UI components (`Loader`, `Pagination`, `ErrorView`) and layout components (`Navbar`, `Layout`).
-   **/src/hooks**: A collection of custom hooks that encapsulate complex logic, promoting reusability and simplifying component logic.
-   **/src/styles**: A global, design-token-based styling system using SASS variables (`_variables.scss`) provides consistent design, while SASS Modules (`*.module.scss`) scope styles to their respective components.
-   **Vite Configuration**: Uses path aliasing (`@/*`) for cleaner, absolute imports.
