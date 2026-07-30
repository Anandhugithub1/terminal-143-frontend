import {AuthRoutes} from './AuthRoutes.jsx'
import { ProfileRoutes } from './ProfileRoutes.jsx';
import {OnboardingRoutes} from './OnboardingRoutes.jsx'
import {SettingsRoutes} from './SettingsRoutes.jsx'
import ErrorPage from "../pages/Error/ErrorPage.jsx";
import {CircleRoutes} from './CircleRoutes.jsx'
import {AppFeatureRoutes} from './AppFeatureRoutes.jsx'
import { Route } from 'react-router-dom';
import App from "../App.jsx";
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '../components/Ui/Spinner.jsx';

const Privacy = lazy(() => import('../pages/Global/others/privacy.jsx'))
const Terms = lazy(() => import('../pages/Global/others/terms.jsx'))
const FAQ = lazy(() => import('../pages/Global/others/FAQ.jsx'))
const Reviews = lazy(() => import('../pages/Global/Review.jsx'))
const NotFoundPage = lazy(() => import('../pages/404/404.jsx'))
export const appRoutes = (

  <Route path="" element={<App />} errorElement={<ErrorPage />}>
    {AuthRoutes}
    {OnboardingRoutes}
    {ProfileRoutes}
    {SettingsRoutes}
    {AppFeatureRoutes}
    {CircleRoutes}
    <Route
      path="privacy"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <Privacy />
        </Suspense>
      }
    />

    <Route
      path="terms"
      element={
        <Suspense fallback={<LoadingSpinner />}>
          <Terms />
        </Suspense>
      }
    />



<Route path='faq' element={
        <Suspense fallback={<LoadingSpinner />}>
          <FAQ />
        </Suspense>
      }
    />


    <Route path='reviews' element={
        <Suspense fallback={<LoadingSpinner />}>
          <Reviews />
        </Suspense>
      }
    />



 <Route
    path="*"
    element={
      <Suspense fallback={<LoadingSpinner />}>
        <NotFoundPage />
      </Suspense>
    }
  />
  

  </Route>
);
