import { getJson, postJson, putJson, deleteJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { CreateProjectInput, Project, ProjectRepository, RoomSchedule } from '../domain/project';
import type { PreviewResponse, ProjectStudies, ValidateResponse } from '../domain/study';

export interface EstimateItem {
  description: string;
  material_id: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  note: string;
}

export interface RoomEstimate {
  room_id: string;
  room_name: string;
  area_m2: number;
  items: EstimateItem[];
  total: number;
}

export interface UpdateProjectInput {
  lot_width?: number;
  lot_depth?: number;
  lot_shape?: string;
  front_setback?: number;
  side_setback?: number;
  back_setback?: number;
  room_schedule?: RoomSchedule;
  auto_arrange?: boolean;
  stories?: number;
  has_garden?: boolean;
  wall_thickness?: number;
}

const list = <T>(v: T[] | null | undefined): T[] => v ?? [];

/**
 * Go nil slices serialize as `null`, not `[]` — normalize the dossier once at
 * the boundary so components can render arrays without null checks.
 */
export function normalizeProject(p: Project): Project {
  if (!p) return p;
  p.phases = list(p.phases);
  for (const ph of p.phases) ph.tasks = list(ph.tasks);
  p.materials = list(p.materials);
  p.selected_material_ids = list(p.selected_material_ids);
  if (p.room_schedule) {
    p.room_schedule.rooms = list(p.room_schedule.rooms);
    p.room_schedule.issues = list(p.room_schedule.issues);
    for (const r of p.room_schedule.rooms) r.materials = list(r.materials);
  }
  const s = p.studies;
  if (!s) return p;
  s.quantitatives = list(s.quantitatives);
  s.disclaimers = list(s.disclaimers);
  if (s.site) {
    s.site.findings = list(s.site.findings);
    s.site.references = list(s.site.references);
  }
  if (s.foundation) {
    s.foundation.findings = list(s.foundation.findings);
    s.foundation.references = list(s.foundation.references);
  }
  if (s.structure) {
    s.structure.findings = list(s.structure.findings);
    s.structure.references = list(s.structure.references);
    s.structure.span_warnings = list(s.structure.span_warnings);
  }
  if (s.budget) {
    s.budget.groups = list(s.budget.groups);
    s.budget.per_room = list(s.budget.per_room);
    for (const g of s.budget.groups) g.items = list(g.items);
    for (const r of s.budget.per_room) r.items = list(r.items);
    s.budget.findings = list(s.budget.findings);
    s.budget.references = list(s.budget.references);
  }
  if (s.schedule) {
    s.schedule.phases = list(s.schedule.phases);
    s.schedule.findings = list(s.schedule.findings);
    s.schedule.references = list(s.schedule.references);
  }
  if (s.quality) {
    s.quality.checks = list(s.quality.checks);
    s.quality.findings = list(s.quality.findings);
  }
  if (s.viability) {
    s.viability.dimensions = list(s.viability.dimensions);
    s.viability.findings = list(s.viability.findings);
  }
  if (s.sustainability) {
    s.sustainability.cbs_detail = list(s.sustainability.cbs_detail);
    s.sustainability.features = list(s.sustainability.features);
    s.sustainability.references = list(s.sustainability.references);
  }
  return p;
}

class ProjectServiceImpl implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    return postJson<Project>(API_ENDPOINTS.projects, input).then(normalizeProject);
  }

  async getById(id: string): Promise<Project> {
    return getJson<Project>(API_ENDPOINTS.projectDetail(id)).then(normalizeProject);
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    return putJson<Project>(API_ENDPOINTS.projectDetail(id), input).then(normalizeProject);
  }

  async simulate(id: string, input: UpdateProjectInput): Promise<Project> {
    return postJson<Project>(API_ENDPOINTS.projectSimulate(id), input).then(normalizeProject);
  }

  async addMaterial(
    id: string,
    materialId: string,
    category?: string,
    roomId?: string,
    quantity?: number,
  ): Promise<Project> {
    return postJson<Project>(`${API_ENDPOINTS.projectDetail(id)}/materials`, {
      material_id: materialId,
      category,
      room_id: roomId,
      quantity,
    }).then(normalizeProject);
  }

  async removeMaterial(id: string, materialId: string): Promise<Project> {
    return deleteJson<Project>(`${API_ENDPOINTS.projectDetail(id)}/materials/${materialId}`).then(normalizeProject);
  }

  async updateMaterialQuantity(id: string, materialId: string, quantity: number): Promise<Project> {
    return putJson<Project>(`${API_ENDPOINTS.projectDetail(id)}/materials/${materialId}`, { quantity }).then(normalizeProject);
  }

  async list(): Promise<Project[]> {
    const res = await getJson<{ projects: Project[] }>(API_ENDPOINTS.projects);
    return list(res.projects).map(normalizeProject);
  }

  async updateTask(projectId: string, phaseId: string, taskId: string, completed: boolean): Promise<Project> {
    return putJson<Project>(`${API_ENDPOINTS.projectDetail(projectId)}/phases/${phaseId}/tasks/${taskId}`, { completed }).then(normalizeProject);
  }

  async estimate(projectId: string, region?: string): Promise<{ project_id: string; estimates: RoomEstimate[]; source: string; educational_only: boolean }> {
    return getJson<{ project_id: string; estimates: RoomEstimate[]; source: string; educational_only: boolean }>(
      `${API_ENDPOINTS.projectDetail(projectId)}/estimate`,
      region ? { region } : undefined,
    );
  }

  /** Runs validation + the full engineering pipeline without persisting. */
  async preview(input: CreateProjectInput): Promise<PreviewResponse> {
    const res = await postJson<PreviewResponse>(API_ENDPOINTS.preview, input);
    res.issues = list(res.issues);
    if (res.project) res.project = normalizeProject(res.project);
    return res;
  }

  /** Validates creation input only — used by the wizard before advancing. */
  async validate(input: CreateProjectInput): Promise<ValidateResponse> {
    const res = await postJson<ValidateResponse>(API_ENDPOINTS.projectsValidate, input);
    res.issues = list(res.issues);
    return res;
  }

  /** Fetches just the engineering dossier for a project. */
  async studies(projectId: string): Promise<{ project_id: string; studies: ProjectStudies; educational_only: boolean }> {
    const res = await getJson<{ project_id: string; studies: ProjectStudies; educational_only: boolean }>(
      API_ENDPOINTS.projectStudies(projectId),
    );
    normalizeProject({ studies: res.studies } as Project);
    return res;
  }
}

export const projectService = new ProjectServiceImpl();
