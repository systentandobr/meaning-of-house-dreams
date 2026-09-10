// Material domain: pure types and repository contract.

export interface MaterialBadge {
  icon: string;
  label: string;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  unit_label?: string;
  description: string;
  category: string;
  display_category?: string;
  applicable_categories?: string[];
  prices_per_region: Record<string, number>;
  sustainability_factor: number;
  co2_kg_per_unit: number;
  lifespan_years: number;
  climate_compatibility: string[];
  source_note: string;
  image_url?: string;
  bio_score?: number;
  badges?: MaterialBadge[];
  origin?: string;
  yield?: string;
  u_value?: string;
  acoustic?: string;
  consumption?: string;
  weight?: string;
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
