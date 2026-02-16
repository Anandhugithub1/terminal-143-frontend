import { Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { LoadingSpinner } from "../components/Ui/Spinner.jsx"
import RequireProfileIncomplete from "../components/RequireProfileIncomplete.jsx"
import { WizardProvider } from "../features/AddProfile/contexts/ProfileWizard.jsx"

const AddDetails = lazy(() =>
  import("../features/AddProfile/pages/Add_Details.jsx")
)

export const OnboardingRoutes = (
  <Route
    path="complete/*"
    element={
        <WizardProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <AddDetails />
          </Suspense>
        </WizardProvider>
    }
  />
)
