import { useState, useRef } from 'react';
import { Icon } from './Icon';
import { useProject } from '../hooks/useProject';
import { useAppStore } from '../store/appStore';
import { useCatalog } from '../hooks/useCatalog';
import type { Room, Project } from '../domain/project';

interface RoomEditorCardProps {
  project: Project;
  room: Room;
}

export function RoomEditorCard({ project, room }: RoomEditorCardProps) {
  const { simulate } = useProject();
  const { setDraftProject, startSimulation, isSimulation } = useAppStore();
  const { catalog } = useCatalog();
  const [width, setWidth] = useState(room.width_m);
  const [depth, setDepth] = useState(room.depth_m);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const materials = catalog?.materials ?? [];

  function categoryForMaterial(materialId: string) {
    const m = materials.find((x) => x.id === materialId);
    return m?.applicable_categories?.[0] || 'wall';
  }

  function updateRoom(updates: Partial<Room>) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updatedRooms = project.room_schedule.rooms.map((r) =>
        r.id === room.id ? { ...r, ...updates } : r
      );
      const schedule = { ...project.room_schedule, rooms: updatedRooms };
      setSaving(true);
      simulate(project.id, { room_schedule: schedule })
        .then((p) => {
          setDraftProject(p);
          if (!isSimulation) startSimulation(p);
        })
        .finally(() => setSaving(false));
    }, 400);
  }

  function setDimension(w: number, d: number) {
    updateRoom({ width_m: w, depth_m: d, area_m2: Math.round(w * d * 100) / 100 });
  }

  function assignMaterial(materialId: string) {
    const category = categoryForMaterial(materialId);
    const existing = room.materials?.filter((m) => m.category !== category) ?? [];
    const price = materials.find((m) => m.id === materialId)?.prices_per_region[project.region] ?? 0;
    const qty = category === 'floor' ? room.area_m2 : category === 'wall' ? 2 * (width + depth) * 3.0 : 1;
    updateRoom({
      materials: [
        ...existing,
        {
          category,
          material_id: materialId,
          quantity: Math.round(qty * 100) / 100,
          unit_price: price,
          total: Math.round(qty * price * 100) / 100,
        },
      ],
    });
  }

  return (
    <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="text-body-md font-body-md font-semibold text-on-surface">{room.name}</h4>
          <p className="text-label-sm text-on-surface-variant">{Math.round(room.area_m2)} m²</p>
        </div>
        <div className="flex items-center gap-1">
          {saving && <span className="text-[10px] text-on-surface-variant">salvando...</span>}
          <button
            onClick={() => setOpen((o) => !o)}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[20px]" />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-outline-variant/40 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Largura (m)</label>
              <input
                type="number"
                step={0.1}
                value={width}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWidth(v);
                  setDimension(v, depth);
                }}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-2 py-1 text-body-md"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Profundidade (m)</label>
              <input
                type="number"
                step={0.1}
                value={depth}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDepth(v);
                  setDimension(width, v);
                }}
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-2 py-1 text-body-md"
              />
            </div>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant block mb-1">Material do ambiente</label>
            <select
              value={room.materials?.[0]?.material_id || ''}
              onChange={(e) => e.target.value && assignMaterial(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 text-body-md"
            >
              <option value="">Recomendação automática</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.applicable_categories?.join(', ') || 'wall'}
                </option>
              ))}
            </select>
          </div>

          {room.materials && room.materials.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {room.materials.map((m, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed uppercase tracking-wide">
                  {m.category}: {materials.find((x) => x.id === m.material_id)?.name || m.material_id}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
