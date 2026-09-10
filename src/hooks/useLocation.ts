import { useEffect, useState } from 'react';
import { locationService } from '../services/locationService';
import type { Location } from '../domain/location';

export interface UseLocationResult {
  location: Location | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não disponível no navegador.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await locationService.resolveByCoordinates(
            pos.coords.latitude,
            pos.coords.longitude,
          );
          setLocation(loc);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  }, []);

  return { location, loading, error };
}
