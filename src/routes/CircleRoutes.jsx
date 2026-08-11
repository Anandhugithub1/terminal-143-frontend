import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"

const CirclesHomePage = lazy(() =>
  import("../features/Circles/pages/CirclesHomePage.jsx")
)

const OnboardingPage = lazy(() =>
  import("../features/Circles/pages/OnboardingPage.jsx")
)

const DiscoverCirclesPage = lazy(() =>
  import("../features/Circles/pages/DiscoverCirclesPage.jsx")
)

const CircleDetailsPage = lazy(() =>
  import("../features/Circles/pages/CircleDetailsPage.jsx")
)

const ModeratorDashboardPage = lazy(() =>
  import("../features/Circles/pages/ModeratorDashboardPage.jsx")
)

const PostDetailsPage = lazy(() =>
  import("../features/Circles/pages/PostDetailsPage.jsx")
)

const CircleChatPage = lazy(() =>
  import("../features/Circles/pages/CircleChatPage.jsx")
)

const MyPostsPage = lazy(() =>
  import("../features/Circles/pages/MyPostsPage.jsx")
)

export const CircleRoutes = (
  <>
    <Route
      path="circles"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <CirclesHomePage />
        </Suspense>
      }
    />
    <Route
      path="circles/onboarding"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <OnboardingPage />
        </Suspense>
      }
    />
    <Route
      path="circles/discover"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <DiscoverCirclesPage />
        </Suspense>
      }
    />
    <Route
      path="circles/my-posts"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <MyPostsPage />
        </Suspense>
      }
    />
    <Route
      path="circles/:circleId"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <CircleDetailsPage />
        </Suspense>
      }
    />
    <Route
      path="circles/:circleId/manage"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <ModeratorDashboardPage />
        </Suspense>
      }
    />
    <Route
      path="circles/:circleId/posts/:postId"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <PostDetailsPage />
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
  </>
)
