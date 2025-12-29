import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { RouterProvider } from 'react-router';
import './styles/main.scss'
import { router } from './Routes/index.js';
import { Suspense } from 'react';
import { Loader } from './components/ui/index.js';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router} />
  </Provider>
)
