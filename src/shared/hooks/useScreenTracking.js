import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setScreenName } from "../lib/analytics.js";

export function useScreenTracking() {
  const location = useLocation();

  useEffect(() => {
    setScreenName(location.pathname);
  }, [location.pathname]);
}
