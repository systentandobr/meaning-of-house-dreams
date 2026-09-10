import { create } from 'zustand';

interface AppState {
  region: string;
  setRegion: (region: string) => void;
  selectedMaterialIds: string[];
  toggleMaterial: (id: string) => void;
  setSelectedMaterials: (ids: string[]) => void;
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
  reset: () => set({ region: DEFAULT_REGION, selectedMaterialIds: [] }),
}));
