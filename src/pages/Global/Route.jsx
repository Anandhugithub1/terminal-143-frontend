
import React, { useEffect, useState } from 'react';

import HomePage from './HomePage';
import LoadingScreen from '../SplashScreen/Splash'; //  animation component

export default function AppHome() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading or translation/data readiness
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000); 

    return () => clearTimeout(timeout);
  }, []);

  return loading ? <LoadingScreen /> : <HomePage />;
}
