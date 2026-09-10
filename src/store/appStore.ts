import { create } from 'zustand';
import type { Project } from '../domain/project';

interface AppState {
  region: string;
  setRegion: (region: string) => void;
  selectedMaterialIds: string[];
  toggleMaterial: (id: string) => void;
  setSelectedMaterials: (ids: string[]) => void;
  isSimulation: boolean;
  draftProject: Project | null;
  setDraftProject: (p: Project | null) => void;
  startSimulation: (p: Project) => void;
  stopSimulation: () => void;
  reset: () => void;
}

const DEFAULT_REGION = 'Sudeste';

export const useAppStore = create<AppState>((set) => ({
  region: DEFAULT_REGION,
  setRegion: (region) => set({ region }),
  selectedMaterialIds: [],
  toggleMaterial: (id) =>
    set((state) => ({
      selectedMaterialIds: state.selectedMaterialIds.includes(id)
        ? state.selectedMaterialIds.filter((m) => m !== id)
        : [...state.selectedMaterialIds, id],
    })),
  setSelectedMaterials: (ids) => set({ selectedMaterialIds: ids }),
  isSimulation: false,
  draftProject: null,
  setDraftProject: (p) => set({ draftProject: p, isSimulation: p !== null }),
  startSimulation: (p) => set({ draftProject: p, isSimulation: true }),
  stopSimulation: () => set({ draftProject: null, isSimulation: false }),
  reset: () => set({ region: DEFAULT_REGION, selectedMaterialIds: [], isSimulation: false, draftProject: null }),
}));
