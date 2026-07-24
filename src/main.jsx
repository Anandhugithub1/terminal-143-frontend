import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./App.css"
import "./i18n/i18n.js"
import "./utils/setVh.js"

import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "./shared/lib/client.js"
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom"

import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { appRoutes } from "./routes/AppRoutes.jsx"
import { Toaster, toast } from "sonner"

import { useAutoReloadOnOnline } from "./shared/hooks/useAutoReloadOnOnline.js"
import { setupChunkReload } from "./shared/hooks/chunkReloadHelper.js"
import { Capacitor } from "@capacitor/core"
import { StatusBar, Style } from "@capacitor/status-bar"
import { PushNotifications } from "@capacitor/push-notifications"

setupChunkReload()

// setOverlaysWebView/setBackgroundColor are documented as unavailable on
// Android 15+ (edge-to-edge is forced there), so they're kept here only for
// older Android/iOS. The actual inset handling for Android 15+ lives natively
// in MainActivity.java, which pads the WebView by the real status bar height.
if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {})
  StatusBar.setStyle({ style: Style.Light }).catch(() => {})
  StatusBar.setBackgroundColor({ color: "#ffffff" }).catch(() => {})
  StatusBar.show().catch(() => {})
}

const router = createBrowserRouter(createRoutesFromElements(appRoutes))

// FCM only auto-shows a system tray notification when the app is backgrounded/killed.
// In the foreground Android delivers the payload silently, so we have to render it ourselves.
if (Capacitor.isNativePlatform()) {
  PushNotifications.addListener("pushNotificationReceived", notification => {
    const url = notification.data?.url

    toast(notification.title, {
      description: notification.body,
      action: url
        ? { label: "View", onClick: () => router.navigate(url) }
        : undefined
    })
  })

  PushNotifications.addListener("pushNotificationActionPerformed", action => {
    const url = action.notification.data?.url
    if (url) router.navigate(url)
  })
}

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