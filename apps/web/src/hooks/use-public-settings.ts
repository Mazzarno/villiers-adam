import { useEffect, useState } from 'react';
import { getPublicSettings, type PublicSettings } from '@/lib/settings';

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const result = await getPublicSettings();
      if (active) {
        setSettings(result);
        setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return { settings, isLoading };
}
