
import './App.css'
import '@fontsource-variable/inter';

import { Outlet } from 'react-router-dom'
import InstagramExitBanner from './shared/banners/InstagramExitBanner';
function App() {

  return (
    <>
          <InstagramExitBanner />

<Outlet/>
    </>
  )
}

export default App
