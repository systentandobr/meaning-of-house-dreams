import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import type { CreateProjectInput, Project } from '../domain/project';
import type { RoomEstimate } from '../services/projectService';

const STORAGE_KEY = 'casa-dos-sonhos:project-id';

function loadStoredId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: string | null;
  create: (input: CreateProjectInput) => Promise<Project>;
  refresh: () => void;
  reset: () => void;
  toggleTask: (phaseId: string, taskId: string, completed: boolean) => Promise<void>;
  estimate: () => Promise<RoomEstimate[]>;
}

const ProjectContext = createContext<UseProjectResult | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const p = await projectService.getById(id);
      setProject(p);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      storeId(null);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = loadStoredId();
    if (id) {
      loadById(id);
    } else {
      projectService
        .list()
        .then((projects) => {
          if (projects.length > 0) {
            const first = projects[projects.length - 1];
            storeId(first.id);
            setProject(first);
          }
        })
        .catch(() => {
          /* backend unavailable; onboarding will handle */
        })
        .finally(() => setLoading(false));
    }
  }, [loadById]);

  const create = useCallback(async (input: CreateProjectInput) => {
    setLoading(true);
    try {
      const p = await projectService.create(input);
      storeId(p.id);
      setProject(p);
      setError(null);
      return p;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    if (project?.id) loadById(project.id);
  }, [project?.id, loadById]);

  const reset = useCallback(() => {
    storeId(null);
    setProject(null);
  }, []);

  const toggleTask = useCallback(async (phaseId: string, taskId: string, completed: boolean) => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const p = await projectService.updateTask(project.id, phaseId, taskId, completed);
      setProject(p);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  const estimate = useCallback(async () => {
    if (!project?.id) return [];
    const res = await projectService.estimate(project.id, project.region);
    return res.estimates;
  }, [project?.id, project?.region]);

  const value: UseProjectResult = {
    project,
    loading,
    error,
    create,
    refresh,
    reset,
    toggleTask,
    estimate,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProject(): UseProjectResult {
  const ctx = useContext(ProjectContext);
  if (!ctx) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return ctx;
}
