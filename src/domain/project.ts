// Project domain: pure types and repository contract.

import type { ProjectStudies } from './study';

export interface Task {
  id: string;
  name: string;
  completed: boolean;
}

export interface Phase {
  id: string;
  order: number;
  name: string;
  description: string;
  duration_months: number;
  start_month: number;
  end_month: number;
  status: 'planned' | 'in_progress' | 'completed';
  tasks: Task[];
  sustainability_notes: string;
  estimated_budget?: number;
  spent_budget?: number;
  /** 0–100, derived by the backend from task completion. */
  progress_pct?: number;
}

export interface RoomMaterial {
  category: string;
  material_id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  width_m: number;
  depth_m: number;
  area_m2: number;
  floor: number;
  x: number;
  y: number;
  features: string[];
  materials?: RoomMaterial[];
}

export interface ProjectMaterial {
  material_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  room_id?: string;
}

/** Structured layout finding produced by the backend layout engine — carries
 * the room/floor so the viewer can highlight the exact element. */
export interface LayoutIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  room_id?: string;
  room_name?: string;
  floor?: number;
  related_room_id?: string;
  related_room_name?: string;
  message: string;
  reference?: string;
}

export interface RoomSchedule {
  rooms: Room[];
  total_area_m2: number;
  living_area_m2: number;
  service_area_m2: number;
  outdoor_area_m2: number;
  circulation_area_m2: number;
  notes: string;
  /** Structured layout conflicts produced by the backend layout engine. */
  issues?: LayoutIssue[];
}

export interface Discovery {
  adults: number;
  children: number;
  elderly: number;
  pets: string[];
  usage: string;
  floors: number;

  bedrooms: number;
  suites: number;
  bathrooms: number;
  half_baths: number;
  closets: number;
  kitchen: boolean;
  pantry: boolean;
  living: boolean;
  dining: boolean;
  office: boolean;
  laundry: boolean;
  garage_spots: number;
  storage: boolean;
  corridors: boolean;

  garden: string[];
  sustainability: string[];
  style: string;
  wind: string;
  sun: string;
  slope: string;
  accessibility: boolean;

  budget: number;
  deadline_months: number;
  priorities: string[];
  dream_text: string;
}
export interface MaterialPreferences { sustainability_weight: number; budget_weight: number; regional_availability: boolean; deadline_weight: number; aesthetic_style: string; max_unit_price?: number; }
export interface ConstructionProfile { construction_method: string; finish_standard: string; material_preferences: MaterialPreferences; }
export interface FloorSpec { number: number; name: string; kind: string; max_area_m2: number; requires_stairs: boolean; }
export interface RoomRequirement { type: string; subtype?: string; min: number; max: number; floor: number; min_area_m2?: number; }

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  region: string;
  state_code: string;
  city: string;
  latitude: number;
  longitude: number;
  bioclimatic_zone: string;

  lot_width: number;
  lot_depth: number;
  lot_shape: string;
  front_setback: number;
  side_setback: number;
  back_setback: number;
  lot_area_m2: number;
  built_area_m2: number;
  garden_area_m2: number;
  outdoor_area_m2: number;
  floor_area_m2: number;

  discovery: Discovery;
  room_schedule: RoomSchedule;
  profile: ConstructionProfile;
  floors: FloorSpec[];
  room_requirements: RoomRequirement[];

  materials: ProjectMaterial[];

  area_m2: number;
  /** Computed estimate (from the budget study). */
  budget: number;
  /** What the user typed — preserved so coverage can be shown. */
  declared_budget?: number;
  stories: number;
  rooms: number;
  has_garden: boolean;
  /** Wall thickness (m) used by the backend floor-plan generator. */
  wall_thickness?: number;
  dreams: string;

  selected_material_ids: string[];
  phases: Phase[];
  cbs: number;
  igo: number;
  notes: string;
  status: string;
  /**
   * Engineering dossier computed by the backend — recomputed on every read.
   * The frontend renders it; it never recomputes it.
   */
  studies?: ProjectStudies;
}

export interface CreateProjectInput {
  name: string;
  region: string;
  state_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  lot_width?: number;
  lot_depth?: number;
  lot_shape?: string;
  front_setback?: number;
  side_setback?: number;
  back_setback?: number;
  floor_area_m2?: number;
  dreams?: string;
  discovery?: Discovery;
  area_m2?: number;
  budget?: number;
  stories?: number;
  rooms?: number;
  has_garden?: boolean;
  profile?: ConstructionProfile;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  getById(id: string): Promise<Project>;
  list(): Promise<Project[]>;
}
