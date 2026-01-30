import { ErrorView } from "@/components/common";
import { Layout } from "@/components/layout";
import { CatalogPage } from "@/pages";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
    {
        path: '/',
        Component: Layout,
        children: [
            {
                ErrorBoundary: ErrorView,
                children: [
                    {
                        index: true,
                        Component: CatalogPage
                    },
                    {
                        path: '/product/:id',
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