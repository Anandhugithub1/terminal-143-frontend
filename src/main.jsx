import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import "./i18n/i18n.js";
import { Provider } from "react-redux";
import { store } from "./Redux/store.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./shared/lib/client.js";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { appRoutes } from "./routes/AppRoutes.jsx"; // route file

const router = createBrowserRouter(createRoutesFromElements(appRoutes));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>
);
