// Material domain: pure types and repository contract.

export interface Material {
  id: string;
  name: string;
  unit: string;
  description: string;
  category: string;
  prices_per_region: Record<string, number>;
  sustainability_factor: number;
  co2_kg_per_unit: number;
  lifespan_years: number;
  climate_compatibility: string[];
  source_note: string;
}

export interface Catalog {
  version: string;
  unit_prices_reference_date: string;
  currency: string;
  regions: string[];
  materials: Material[];
}

export interface MaterialRepository {
  getCatalog(): Promise<Catalog>;
  recommendMaterials(region: string, climate: string, maxPrice?: number): Promise<Material[]>;
}
