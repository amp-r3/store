import { createBrowserRouter } from "react-router";
import { Paths } from "./path";
import Layout from "@/components/layout/Layout";
import { ErrorView } from "@/components/ui";
import CatalogPage from "@/pages/CatalogPage/CatalogPage";
import Page404 from "@/pages/Page404/Page404";

export const router = createBrowserRouter([
    {
        path: Paths.home,
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
                        path: Paths.productPage,
                        lazy: async () => {
                            const module = await import("@/pages/ProductPage/ProductPage");
                            return { Component: module.default }
                        },
                    },
                    {
                        path: "*",
                        Component: Page404,
                    }
                ]
            }
        ]
    }
])