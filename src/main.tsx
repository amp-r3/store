import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { persistor, store } from "./app/store.js";
import { RouterProvider } from 'react-router';
import './styles/main.scss'
import { router } from './app/router.js';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>
)
