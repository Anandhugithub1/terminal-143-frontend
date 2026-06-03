import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"

const CirclesHomePage = lazy(() =>
  import("../features/Circles/pages/CirclesHomePage.jsx")
)

const OnboardingPage = lazy(() =>
  import("../features/Circles/pages/OnboardingPage.jsx")
)

// const CircleDetailsPage = lazy(() =>
//   import("../features/Circles/pages/CircleDetailsPage.jsx")
// )

// const CreateCirclePage = lazy(() =>
//   import("../features/Circles/pages/CreateCirclePage.jsx")
// )

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


{/* 
    <Route
      path="circles/create"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <CreateCirclePage />
        </Suspense>
      }
    /> */}

    {/* <Route
      path="circles/:circleId"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <CircleDetailsPage />
        </Suspense>
      }
    /> */}
  </>
)