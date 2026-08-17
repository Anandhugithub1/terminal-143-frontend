import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"
import DefaultHomeRoute from "./DefaultHomeRoute.jsx"

const ChatListPage = lazy(() => import("../features/Chat/pages/ChatListPage.jsx"))
const ChatConversationPage = lazy(() => import("../features/Chat/pages/ChatConversationPage.jsx"))
const SupportChatPage = lazy(() => import("../features/Chat/pages/SupportChatPage.jsx"))
const CircleChatPage = lazy(() => import("../features/Circles/pages/CircleChatPage.jsx"))
const RequestsPage = lazy(() => import("../features/UserHome/pages/Request.jsx"))
import NotificationsPage from "../features/Notifications/pages/NotificationsPage.jsx"
import ChatListShell from "../features/Chat/pages/ChatListShell.jsx"
export const AppFeatureRoutes = (
  <>
    <Route index element={<DefaultHomeRoute />} />
    <Route path="home" element={<DefaultHomeRoute />} />

    <Route
      path="matches"
      element={
        <ChatListShell>
          <Suspense fallback={<LoadingSpinner />}>
            <ChatListPage />
          </Suspense>
        </ChatListShell>
      }
    >
      <Route
        path=":matchId/chat"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <ChatConversationPage />
          </Suspense>
        }
      />
      <Route
        path="circles/:circleId/chat"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <CircleChatPage />
          </Suspense>
        }
      />
      <Route
        path="support/chat"
        element={
          <Suspense fallback={<LoadingSpinner />}>
            <SupportChatPage />
          </Suspense>
        }
      />
    </Route>

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
