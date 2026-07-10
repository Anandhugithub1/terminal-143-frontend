
import './App.css'
setTimeout(() => {
  import("@fontsource-variable/inter");
}, 0);
import { Outlet } from 'react-router-dom'
import InstagramExitBanner from './shared/banners/InstagramExitBanner';
import LanguageSync from './i18n/LanguageSync';
function App() {

  return (
    <>
    <LanguageSync/>
          <InstagramExitBanner />
<Outlet/>
    </>
  )
}

export default App
