
import './App.css'
setTimeout(() => {
  import("@fontsource-variable/inter");
}, 0);
import { Outlet } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import InstagramExitBanner from './shared/banners/InstagramExitBanner';
import LanguageSync from './i18n/LanguageSync';
import { useRegionGate } from './shared/regionGate/useRegionGate';
import ComingSoonScreen from './shared/regionGate/ComingSoonScreen';
import { useScreenTracking } from './shared/hooks/useScreenTracking';

// Age verification (deferred, region-gated). Lazy so its liveness/flow code
// stays out of the initial bundle; it self-hides ('ok' state) for SEA/verified
// users and when the backend feature flag is off.
const AgeGate = lazy(() => import('./features/AgeVerification/AgeGate'));

function App() {
  const { blocked, checked } = useRegionGate()
  useScreenTracking()

  if (checked && blocked) {
    return <ComingSoonScreen />
  }

  return (
    <>
    <LanguageSync/>
          <InstagramExitBanner />
      <Suspense fallback={null}>
        <AgeGate />
      </Suspense>
<Outlet/>
    </>
  )
}

export default App
