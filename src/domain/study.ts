// Engineering dossier types — mirrors entity/*.go. The backend computes
// everything; the frontend only renders these shapes.

export interface Citation {
  ref: string;
  basis: string;
}

export interface Finding {
  severity: 'info' | 'warning' | 'error';
  code: string;
  message: string;
  reference?: string;
}

export interface StudyMeta {
  schema_version: number;
  generated_at: string;
  confidence: 'educational_parametric' | 'partial' | 'unavailable';
}

export interface EnvelopeM {
  x: number;
  y: number;
  width: number;
  depth: number;
}

export interface SiteStudy {
  lot_area_m2: number;
  shape_factor: number;
  envelope: EnvelopeM;
  buildable_area_m2: number;
  built_area_m2: number;
  garden_area_m2: number;
  outdoor_area_m2: number;
  floor_area_m2: number;
  occupancy_rate_pct: number;
  permeable_rate_pct: number;
  findings: Finding[];
  references: Citation[];
}

export interface FoundationStudy {
  load_kn_per_m2: number;
  total_load_kn: number;
  assumed_soil_capacity_kpa: number;
  recommended_type: string;
  reason: string;
  concrete_volume_m3: number;
  steel_kg: number;
  excavation_volume_m3: number;
  findings: Finding[];
  references: Citation[];
}

export interface StructureStudy {
  method: string;
  system: string;
  concrete_volume_m3: number;
  steel_kg: number;
  masonry_area_m2: number;
  slab_area_m2: number;
  roof_area_m2: number;
  openings_area_m2: number;
  max_span_m: number;
  span_warnings: string[];
  findings: Finding[];
  references: Citation[];
}

export interface QuantitativeItem {
  scope: string;
  item: string;
  quantity: number;
  unit: string;
  basis: string;
  reference?: string;
}

export interface BudgetItem {
  group: string;
  description: string;
  material_id?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  note?: string;
}

export interface BudgetGroup {
  id: string;
  label: string;
  items: BudgetItem[];
  subtotal: number;
}

export interface RoomBudgetLine {
  room_id: string;
  room_name: string;
  area_m2: number;
  items: BudgetItem[];
  total: number;
}

export interface BudgetStudy {
  groups: BudgetGroup[];
  per_room: RoomBudgetLine[];
  materials_subtotal: number;
  labor_subtotal: number;
  labor_factor: number;
  bdi_pct: number;
  contingency_pct: number;
  total: number;
  cost_per_m2: number;
  reference_min_per_m2: number;
  reference_max_per_m2: number;
  within_reference: boolean;
  user_budget: number;
  budget_coverage: number;
  findings: Finding[];
  references: Citation[];
}

export interface ScheduledPhase {
  phase_id: string;
  name: string;
  duration_months: number;
  start_month: number;
  end_month: number;
  driver: string;
  budget_share: number;
}

export interface ScheduleStudy {
  phases: ScheduledPhase[];
  total_months: number;
  deadline_months: number;
  feasible: boolean;
  findings: Finding[];
  references: Citation[];
}

export interface QualityCheck {
  id: string;
  label: string;
  severity: string;
  passed: boolean;
  detail: string;
  reference?: string;
}

export interface QualityStudy {
  checks: QualityCheck[];
  passed: number;
  total: number;
  score: number;
  findings: Finding[];
}

export interface ViabilityDimension {
  id: string;
  label: string;
  score: number;
  weight: number;
  derivation: string;
}

export interface ViabilityStudy {
  igo: number;
  seal: string;
  dimensions: ViabilityDimension[];
  findings: Finding[];
}

export interface MaterialCBSLine {
  material_id: string;
  name: string;
  score: number;
}

export interface SavingsBreakdown {
  solar: number;
  water: number;
  durability: number;
  total: number;
}

export interface SustainabilityStudy {
  embodied_co2_kg: number;
  embodied_co2_t_per_m2: number;
  savings_15y: SavingsBreakdown;
  payback_years: number;
  conventional_cost_per_m2: number;
  project_cost_per_m2: number;
  cbs_detail: MaterialCBSLine[];
  cbs_average: number;
  features: string[];
  references: Citation[];
}

export interface ProjectStudies {
  meta: StudyMeta;
  site: SiteStudy;
  foundation: FoundationStudy;
  structure: StructureStudy;
  quantitatives: QuantitativeItem[];
  budget: BudgetStudy;
  schedule: ScheduleStudy;
  quality: QualityStudy;
  viability: ViabilityStudy;
  sustainability: SustainabilityStudy;
  disclaimers: string[];
}

export interface FieldIssue {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface PreviewResponse {
  valid: boolean;
  issues: FieldIssue[];
  project: import('./project').Project;
  educational_only: boolean;
}

export interface ValidateResponse {
  valid: boolean;
  issues: FieldIssue[];
}
