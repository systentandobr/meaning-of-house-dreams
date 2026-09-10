// Project domain: pure types and repository contract.

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
}

export interface RoomMaterial {
  category: string;
  material_id: string;
  quantity: number;
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

export interface RoomSchedule {
  rooms: Room[];
  total_area_m2: number;
  living_area_m2: number;
  service_area_m2: number;
  outdoor_area_m2: number;
  circulation_area_m2: number;
  notes: string;
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

  area_m2: number;
  budget: number;
  stories: number;
  rooms: number;
  has_garden: boolean;
  dreams: string;

  selected_material_ids: string[];
  phases: Phase[];
  cbs: number;
  igo: number;
  notes: string;
  status: string;
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
  floor_area_m2?: number;
  dreams?: string;
  discovery?: Discovery;
  area_m2?: number;
  budget?: number;
  stories?: number;
  rooms?: number;
  has_garden?: boolean;
}

export interface ProjectRepository {
  create(input: CreateProjectInput): Promise<Project>;
  getById(id: string): Promise<Project>;
  list(): Promise<Project[]>;
}
