import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"
import DefaultHomeRoute from "./DefaultHomeRoute.jsx"

const ChatListPage = lazy(() => import("../features/Chat/pages/ChatListPage.jsx"))
const ChatConversationPage = lazy(() => import("../features/Chat/pages/ChatConversationPage.jsx"))
const RequestsPage = lazy(() => import("../features/UserHome/pages/Request.jsx"))
import NotificationsPage from "../features/Notifications/pages/NotificationsPage.jsx"
export const AppFeatureRoutes = (
  <>
    <Route index element={<DefaultHomeRoute />} />
    <Route path="home" element={<DefaultHomeRoute />} />

    <Route
      path="matches"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ChatListPage />
        </Suspense>
      }
    />

    <Route
      path="matches/:matchId/chat"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ChatConversationPage />
        </Suspense>
      }
    />

    <Route
      path="requests"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <RequestsPage />
        </Suspense>
      }
    />

    <Route path="notifications" 
    
    element={

      <NotificationsPage/>
    }
    />
  </>
)
