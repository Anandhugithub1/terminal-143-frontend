import {AuthRoutes} from './AuthRoutes.jsx'
import { ProfileRoutes } from './ProfileRoutes.jsx';
import {OnboardingRoutes} from './OnboardingRoutes.jsx'
import {SettingsRoutes} from './SettingsRoutes.jsx'
import ErrorPage from "../pages/Error/ErrorPage.jsx";
import {AppFeatureRoutes} from './AppFeatureRoutes.jsx'
import { Route } from 'react-router-dom';
import App from "../App.jsx";
import { Suspense } from 'react';
import NotFoundPage from '../pages/404/404.jsx'
import { LoadingSpinner } from '../components/Ui/Spinner.jsx';
export const appRoutes = (

  <Route path="" element={<App />} errorElement={<ErrorPage />}>
    {AuthRoutes}
    {OnboardingRoutes}
    {ProfileRoutes}
    {SettingsRoutes}
    {AppFeatureRoutes}


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
