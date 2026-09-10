// Supplier domain: pure types and repository contract.

export interface Supplier {
  id: string;
  name: string;
  category: string;
  state: string;
  city: string;
  region: string;
  material_ids: string[];
  phone: string;
  email: string;
  website: string;
  notes: string;
  source: string;
}

export interface SearchSuppliersRequest {
  region?: string;
  state?: string;
  city?: string;
  query?: string;
  category?: string;
  material_id?: string;
}

export interface SupplierRepository {
  search(req: SearchSuppliersRequest): Promise<{ suppliers: Supplier[]; query: SearchSuppliersRequest; educational_only: boolean; source: string }>;
}
