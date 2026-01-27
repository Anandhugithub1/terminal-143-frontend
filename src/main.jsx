import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./App.css"
import "./i18n/i18n.js"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./shared/lib/client.js"
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { appRoutes } from "./routes/AppRoutes.jsx"
import { Toaster } from "sonner"

import { useAutoReloadOnOnline } from "./shared/hooks/useAutoReloadOnOnline.js"
import { setupChunkReload } from "./shared/hooks/chunkReloadHelper.js"

setupChunkReload()

const router = createBrowserRouter(createRoutesFromElements(appRoutes))

function Root() {
  useAutoReloadOnOnline()

  return (
    <>
      <Toaster richColors position="top-center" />
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </>
  )
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => {
        console.log("Service worker registered")
      })
      .catch(err => {
        console.error("Service worker registration failed", err)
      })
  })
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </StrictMode>
)
