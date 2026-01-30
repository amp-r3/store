import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { RouterProvider } from 'react-router';
import './styles/main.scss'
import { router } from './app/router.js';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <RouterProvider router={router} />
  </Provider>
)
