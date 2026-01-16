import { useEffect } from "react";

export function useAutoReloadOnOnline() {
  useEffect(() => {
    function handleOnline() {
      window.location.reload();
    }

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
