import { ErrorView } from "@/components/common";
import { MainLayout } from "@/components/layout/Layout/MainLayout/MainLayout";
import RootLayout from "@/components/layout/Layout/RootLayout/RootLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "@/components/layout/PublicRoute/PublicRoute";
import { CatalogPage } from "@/pages";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    ErrorBoundary: ErrorView,
    children: [
      {
        Component: MainLayout,
        path: '/',
        ErrorBoundary: ErrorView,
        children: [
          {
            index: true,
            Component: CatalogPage
          },
          {
            path: 'product/:id',
            lazy: async () => {
              const module = await import("@/pages/ProductPage/ProductPage");
              return { Component: module.ProductPage }
            },
          },
          {
            path: 'wishlist',
            lazy: async () => {
              const module = await import("@/pages/WishlistPage/WishlistPage")
              return { Component: module.WishListPage }
            }
          },
          {
            Component: ProtectedRoute,
            children: [
              {
                path: 'user',
                lazy: async () => {
                  const module = await import("@/pages/UserPage/UserPage")
                  return { Component: module.UserPage }
                }
              }
            ]
          },
          {
            path: '*',
            lazy: async () => {
              const module = await import("@/pages/Page404/Page404");
              return { Component: module.Page404 }
            }
          },
        ]
      },

      {
        Component: PublicRoute,
        ErrorBoundary: ErrorView,
        children: [
          {
            path: 'login',
            lazy: async () => {
              const module = await import("@/pages/LoginPage/LoginPage")
              return { Component: module.LoginPage }
            }
          },
          {
            path: 'register',
            lazy: async () => {
              const module = await import("@/pages/RegisterPage/RegisterPage")
              return { Component: module.RegisterPage }
            }
          }
        ]
      }
    ]
  }
])