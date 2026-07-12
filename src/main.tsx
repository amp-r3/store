import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { persistor, store } from "./app/store.js";
import { RouterProvider } from 'react-router';
import "@/app/styles/main.scss";
import { router } from './app/router.js';
import { PersistGate } from 'redux-persist/integration/react';
import 'react-loading-skeleton/dist/skeleton.css'
import { SkeletonTheme } from 'react-loading-skeleton'


createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <SkeletonTheme
        baseColor="var(--skeleton-base)"
        highlightColor="var(--skeleton-highlight)"
      >
        <RouterProvider router={router} />
      </SkeletonTheme>
    </PersistGate>
  </Provider>
)
