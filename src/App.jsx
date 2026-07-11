
import './App.css'
setTimeout(() => {
  import("@fontsource-variable/inter");
}, 0);
import { Outlet } from 'react-router-dom'
import InstagramExitBanner from './shared/banners/InstagramExitBanner';
import LanguageSync from './i18n/LanguageSync';
import { useRegionGate } from './shared/regionGate/useRegionGate';
import ComingSoonScreen from './shared/regionGate/ComingSoonScreen';
function App() {
  const { blocked, checked } = useRegionGate()

  if (checked && blocked) {
    return <ComingSoonScreen />
  }

  return (
    <>
    <LanguageSync/>
          <InstagramExitBanner />
<Outlet/>
    </>
  )
}

export default App
