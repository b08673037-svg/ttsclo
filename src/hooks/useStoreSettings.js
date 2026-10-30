import { useState, useEffect } from "react";
import { subscribeToSettings } from "../services/settingsService";

export function useStoreSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback: Stop loading after 2 seconds even if Firebase doesn't respond
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const unsubscribe = subscribeToSettings((data) => {
      clearTimeout(timeoutId);
      setSettings(data);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return { settings, loading };
}