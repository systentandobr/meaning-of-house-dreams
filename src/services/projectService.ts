import { getJson, postJson, putJson } from './api/httpClient';
import { API_ENDPOINTS } from './api/endpoints';
import type { CreateProjectInput, Project, ProjectRepository } from '../domain/project';

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

class ProjectServiceImpl implements ProjectRepository {
  async create(input: CreateProjectInput): Promise<Project> {
    return postJson<Project>(API_ENDPOINTS.projects, input);
  }

  async getById(id: string): Promise<Project> {
    return getJson<Project>(API_ENDPOINTS.projectDetail(id));
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
