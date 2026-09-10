import { useState } from 'react';
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
  const { simulate, addMaterial, removeMaterial } = useProject();
  const { setDraftProject, isSimulation, startSimulation } = useAppStore();
  const { catalog } = useCatalog();
  const [width, setWidth] = useState(room.width_m);
  const [depth, setDepth] = useState(room.depth_m);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const materials = catalog?.materials ?? [];

  async function updateRoom(updates: Partial<Room>) {
    const updatedRooms = project.room_schedule.rooms.map((r) =>
      r.id === room.id ? { ...r, ...updates } : r
    );
    const schedule = { ...project.room_schedule, rooms: updatedRooms };
    setSaving(true);
    try {
      const p = await simulate(project.id, { room_schedule: schedule });
      setDraftProject(p);
      if (!isSimulation) startSimulation(p);
    } finally {
      setSaving(false);
    }
  }

  async function setDimension(w: number, d: number) {
    await updateRoom({ width_m: w, depth_m: d, area_m2: Math.round(w * d * 100) / 100 });
  }

  async function assignMaterial(materialId: string) {
    if (!materialId) return;
    setSaving(true);
    try {
      const p = await addMaterial(project.id, materialId, undefined, room.id);
      setDraftProject(p);
      if (!isSimulation) startSimulation(p);
    } finally {
      setSaving(false);
    }
  }

  async function removeRoomMaterial(materialId: string) {
    setSaving(true);
    try {
      const p = await removeMaterial(project.id, materialId);
      setDraftProject(p);
      if (!isSimulation) startSimulation(p);
    } finally {
      setSaving(false);
    }
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
            <label className="text-label-sm text-on-surface-variant block mb-1">Adicionar material ao ambiente</label>
            <select
              value=""
              onChange={(e) => e.target.value && assignMaterial(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 text-body-md"
            >
              <option value="">Selecionar material...</option>
              {materials
                .filter((m) => !room.materials?.some((rm) => rm.material_id === m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} — R$ {m.prices_per_region[project.region]?.toFixed(2).replace('.', ',')} / {m.unit}
                  </option>
                ))}
            </select>
          </div>

          {room.materials && room.materials.length > 0 && (
            <div className="space-y-2">
              {room.materials.map((m) => (
                <div key={m.material_id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container border border-outline-variant/60">
                  <div>
                    <span className="text-body-sm font-semibold text-on-surface">{m.name}</span>
                    <span className="text-label-sm text-on-surface-variant block">{m.category} • {m.quantity} {m.unit}</span>
                  </div>
                  <button
                    onClick={() => removeRoomMaterial(m.material_id)}
                    className="p-1.5 rounded-lg hover:bg-error-container text-error"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
