import { getJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type {
  Supplier,
  SearchSuppliersRequest,
  SupplierRepository,
} from '../domain/supplier';

class SupplierServiceImpl implements SupplierRepository {
  async search(req: SearchSuppliersRequest): Promise<{
    suppliers: Supplier[];
    query: SearchSuppliersRequest;
    educational_only: boolean;
    source: string;
  }> {
    return getJson<{
      suppliers: Supplier[];
      query: SearchSuppliersRequest;
      educational_only: boolean;
      source: string;
    }>(API_ENDPOINTS.suppliersSearch, req as Record<string, string | undefined>);
  }
}

export const supplierService = new SupplierServiceImpl();
export type { Supplier };
