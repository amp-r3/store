import { ErrorView } from "@/components/common";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute/ProtectedRoute";
import { PublicRoute } from "@/components/layout/PublicRoute/PublicRoute";
import { CatalogPage } from "@/pages";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                Component: PublicRoute,
                children: [
                  {
                    path: "*",
                    lazy: async () => {
                        const module = await import("@/pages/Page404/Page404");
                        return { Component: module.Page404 }
                    }
                  },
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
                  },
                ]
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
                    }
                ]
            }
        ]
    }
])