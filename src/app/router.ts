import { ErrorView } from "@/components/common";
import { Layout } from "@/components/layout";
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
                        path: "*",
                        lazy: async () => {
                            const module = await import("@/pages/Page404/Page404");
                            return { Component: module.Page404 }
                        }
                    }
                ]
            }
        ]
    }
])