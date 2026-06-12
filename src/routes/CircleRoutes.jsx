import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"

const CirclesHomePage = lazy(() =>
  import("../features/Circles/pages/CirclesHomePage.jsx")
)

const OnboardingPage = lazy(() =>
  import("../features/Circles/pages/OnboardingPage.jsx")
)

const CircleDetailsPage = lazy(() =>
  import("../features/Circles/pages/CircleDetailsPage.jsx")
)

const PostDetailsPage = lazy(() =>
  import("../features/Circles/pages/PostDetailsPage.jsx")
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
      path="circles/:circleId"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <CircleDetailsPage />
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
  </>
)
