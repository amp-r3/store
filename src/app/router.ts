import { ErrorView } from "@/shared/ui";
import { CheckoutGuard } from "@/app/providers/CheckoutGuard/CheckoutGuard";
import { MainLayout } from "@/app/layouts/MainLayout/MainLayout";
import RootLayout from "@/app/layouts/RootLayout/RootLayout";
import { UserLayout } from "@/app/layouts/UserLayout/UserLayout";
import { AdminLayout } from "@/app/layouts/AdminLayout/AdminLayout";
import { ProtectedRoute } from "@/app/providers/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "@/app/providers/PublicRoute/PublicRoute";
import { AdminRoute } from "@/app/providers/AdminRoute/AdminRoute";
import CatalogPage from "@/views/catalog-page";
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
              const module = await import("@/views/home-page");
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
              const module = await import("@/views/product-page");
              return { Component: module.default }
            },
          },
          {
            path: 'wishlist',
            lazy: async () => {
              const module = await import("@/views/wishlist-page")
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
                      const module = await import("@/views/user-page")
                      return { Component: module.default }
                    }
                  },
                  {
                    path: 'reviews',
                    lazy: async () => {
                      const module = await import("@/views/user-reviews-page")
                      return { Component: module.default }
                    }
                  },
                  {
                    path: 'orders',
                    lazy: async () => {
                      const module = await import("@/views/user-orders-page")
                      return { Component: module.default }
                    }
                  },
                  {
                    path: 'notifications',
                    lazy: async () => {
                      const module = await import("@/views/user-notifications-page")
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
              const module = await import("@/views/not-found-page");
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
          const module = await import("@/views/auth-callback-page")
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
              const module = await import("@/views/login-page")
              return { Component: module.default }
            }
          },
          {
            path: 'register',
            lazy: async () => {
              const module = await import("@/views/register-page")
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
              const module = await import("@/views/checkout-page")
              return { Component: module.default }
            }
          },
          {
            path: 'success',
            lazy: async () => {
              const module = await import("@/views/checkout-success-page")
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
                  const module = await import("@/views/admin-dashboard-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'orders',
                lazy: async () => {
                  const module = await import("@/views/admin-orders-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products',
                lazy: async () => {
                  const module = await import("@/views/admin-products-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products/new',
                lazy: async () => {
                  const module = await import("@/views/admin-product-form-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products/:id/edit',
                lazy: async () => {
                  const module = await import("@/views/admin-product-form-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'products/low-stock',
                lazy: async () => {
                  const module = await import("@/views/admin-low-stock-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'categories',
                lazy: async () => {
                  const module = await import("@/views/admin-categories-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'customers',
                lazy: async () => {
                  const module = await import("@/views/admin-customers-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'reviews',
                lazy: async () => {
                  const module = await import("@/views/admin-reviews-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'settings',
                lazy: async () => {
                  const module = await import("@/views/admin-settings-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'audit',
                lazy: async () => {
                  const module = await import("@/views/admin-audit-page")
                  return { Component: module.default }
                }
              },
              {
                path: 'finance',
                lazy: async () => {
                  const module = await import("@/views/admin-finance-page")
                  return { Component: module.default }
                }
              },
              {
                path: '*',
                lazy: async () => {
                  const module = await import("@/views/not-found-page")
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