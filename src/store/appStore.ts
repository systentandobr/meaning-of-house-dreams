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
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  hoveredRoomId: string | null;
  setHoveredRoomId: (id: string | null) => void;
  activeFloor: number;
  setActiveFloor: (floor: number) => void;
  magneticSnapEnabled: boolean;
  setMagneticSnapEnabled: (enabled: boolean) => void;
  wallThickness: number;
  setWallThickness: (thickness: number) => void;
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
  selectedRoomId: null,
  setSelectedRoomId: (selectedRoomId) => set({ selectedRoomId }),
  hoveredRoomId: null,
  setHoveredRoomId: (hoveredRoomId) => set({ hoveredRoomId }),
  activeFloor: 1,
  setActiveFloor: (activeFloor) => set({ activeFloor }),
  magneticSnapEnabled: true,
  setMagneticSnapEnabled: (magneticSnapEnabled) => set({ magneticSnapEnabled }),
  wallThickness: 0.15,
  setWallThickness: (wallThickness) => set({ wallThickness }),
  reset: () =>
    set({
      region: DEFAULT_REGION,
      selectedMaterialIds: [],
      isSimulation: false,
      draftProject: null,
      selectedRoomId: null,
      hoveredRoomId: null,
      activeFloor: 1,
      magneticSnapEnabled: true,
      wallThickness: 0.15,
    }),
}));
