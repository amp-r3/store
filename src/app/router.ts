import { ErrorView } from "@/shared/ui";
import { CheckoutGuard } from "@/app/providers/CheckoutGuard/CheckoutGuard";
import { MainLayout } from "@/app/layouts/MainLayout/MainLayout";
import RootLayout from "@/app/layouts/RootLayout/RootLayout";
import { UserLayout } from "@/app/layouts/UserLayout/UserLayout";
import { AdminLayout } from "@/app/layouts/AdminLayout/AdminLayout";
import { ProtectedRoute } from "@/app/providers/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "@/app/providers/PublicRoute/PublicRoute";
import { AdminRoute } from "@/app/providers/AdminRoute/AdminRoute";
import CatalogPage from "@/pages/catalog-page";
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
            lazy: async () => {
              const module = await import("@/pages/home-page");
              return { Component: module.default }
            },
          },
          {
            path: 'catalog',
            Component: CatalogPage,
          },
          {
            path: 'product/:id',
            lazy: async () => {
              const module = await import("@/pages/product-page");
              return { Component: module.default }
            },
          },
          {
            path: 'wishlist',
            lazy: async () => {
              const module = await import("@/pages/wishlist-page")
              return { Component: module.default }
            }
          },
          {
            Component: ProtectedRoute,
            children: [
              {
                path: 'user',
                Component: UserLayout,
                children: [
                  {
                    index: true,
                    lazy: async () => {
                      const module = await import("@/pages/user-page")
                      return { Component: module.default }
                    }
                  },
                  {
                    path: 'reviews',
                    lazy: async () => {
                      const module = await import("@/pages/user-reviews-page")
                      return { Component: module.default }
                    }
                  },
                  {
                    path: 'orders',
                    lazy: async () => {
                      const module = await import("@/pages/user-orders-page")
                      return { Component: module.default }
                    }
                  },
                  {
                    path: 'notifications',
                    lazy: async () => {
                      const module = await import("@/pages/user-notifications-page")
                      return { Component: module.default }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: '*',
            lazy: async () => {
              const module = await import("@/pages/not-found-page");
              return { Component: module.default }
            }
          },
        ]
      },

      {
        // No guard: must render while the auth session settles after an
        // OAuth round-trip, and it owns its own navigation once
        // useSessionSync populates a live token.
        path: 'auth/callback',
        ErrorBoundary: ErrorView,
        lazy: async () => {
          const module = await import("@/pages/auth-callback-page")
          return { Component: module.default }
        }
      },
      {
        Component: PublicRoute,
        ErrorBoundary: ErrorView,
        children: [
          {
            path: 'login',
            lazy: async () => {
              const module = await import("@/pages/login-page")
              return { Component: module.default }
            }
          },
          {
            path: 'register',
            lazy: async () => {
              const module = await import("@/pages/register-page")
              return { Component: module.default }
            }
          }
        ]
      },
      {
        path: '/checkout',
        Component: CheckoutGuard,
        children: [
          {
            index: true,
            lazy: async () => {
              const module = await import("@/pages/checkout-page")
              return { Component: module.default }
            }
          },
          {
            path: 'success',
            lazy: async () => {
              const module = await import("@/pages/checkout-success-page")
              return { Component: module.default }
            }
          },
        ],
      },

      {
        path: '/admin',
        Component: AdminRoute,
        ErrorBoundary: ErrorView,
        children: [
          {
            Component: AdminLayout,
            children: [
              {
                index: true,
                lazy: async () => {
                  const module = await import("@/pages/admin-dashboard-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'orders',
                lazy: async () => {
                  const module = await import("@/pages/admin-orders-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products',
                lazy: async () => {
                  const module = await import("@/pages/admin-products-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products/new',
                lazy: async () => {
                  const module = await import("@/pages/admin-product-form-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products/:id/edit',
                lazy: async () => {
                  const module = await import("@/pages/admin-product-form-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products/low-stock',
                lazy: async () => {
                  const module = await import("@/pages/admin-low-stock-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'categories',
                lazy: async () => {
                  const module = await import("@/pages/admin-categories-page")
                  return { Component: module.default }
                }
              },
              {
                path: '*',
                lazy: async () => {
                  const module = await import("@/pages/not-found-page")
                  return { Component: module.default }
                }
              },
            ]
          }
        ]
      },

    ]
  }
])