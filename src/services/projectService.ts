import { getJson, postJson, putJson, postJson as patchJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { CreateProjectInput, Project, ProjectRepository, RoomSchedule } from '../domain/project';

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
}

class ProjectServiceImpl implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    return postJson<Project>(API_ENDPOINTS.projects, input);
  }

  async getById(id: string): Promise<Project> {
    return getJson<Project>(API_ENDPOINTS.projectDetail(id));
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    return putJson<Project>(API_ENDPOINTS.projectDetail(id), input);
  }

  async simulate(id: string, input: UpdateProjectInput): Promise<Project> {
    return patchJson<Project>(API_ENDPOINTS.projectSimulate(id), input);
  }

  async list(): Promise<Project[]> {
    const res = await getJson<{ projects: Project[] }>(API_ENDPOINTS.projects);
    return res.projects;
  }

  async updateTask(projectId: string, phaseId: string, taskId: string, completed: boolean): Promise<Project> {
    return putJson<Project>(`${API_ENDPOINTS.projectDetail(projectId)}/phases/${phaseId}/tasks/${taskId}`, { completed });
  }

  async estimate(projectId: string, region?: string): Promise<{ project_id: string; estimates: RoomEstimate[]; source: string; educational_only: boolean }> {
    return getJson<{ project_id: string; estimates: RoomEstimate[]; source: string; educational_only: boolean }>(
      `${API_ENDPOINTS.projectDetail(projectId)}/estimate`,
      region ? { region } : undefined,
    );
  }
}

export const projectService = new ProjectServiceImpl();
