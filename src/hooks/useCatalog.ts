import { useEffect, useState } from 'react';
import { materialService } from '../services/materialService';
import type { Catalog } from '../domain/material';

export interface UseCatalogResult {
  catalog: Catalog | null;
  loading: boolean;
  error: string | null;
}

export function useCatalog(): UseCatalogResult {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    materialService
      .getCatalog()
      .then(setCatalog)
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { catalog, loading, error };
}
