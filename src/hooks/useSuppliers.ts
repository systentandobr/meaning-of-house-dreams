import { useState, useCallback } from 'react';
import { supplierService } from '../services/supplierService';
import type { Supplier, SearchSuppliersRequest } from '../domain/supplier';

export interface UseSuppliersResult {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  search: (req: SearchSuppliersRequest) => Promise<void>;
}

export function useSuppliers(): UseSuppliersResult {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (req: SearchSuppliersRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await supplierService.search(req);
      setSuppliers(res.suppliers);
    } catch (e: any) {
      setError(e.message);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { suppliers, loading, error, search };
}
