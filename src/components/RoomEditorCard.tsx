import { useState, useEffect } from 'react';
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
  const { setDraftProject, isSimulation, startSimulation, selectedRoomId, setSelectedRoomId } = useAppStore();
  const { catalog } = useCatalog();
  const [width, setWidth] = useState(room.width_m);
  const [depth, setDepth] = useState(room.depth_m);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isSelected = selectedRoomId === room.id;

  useEffect(() => {
    setWidth(room.width_m);
    setDepth(room.depth_m);
  }, [room.width_m, room.depth_m]);

  useEffect(() => {
    if (isSelected) {
      setOpen(true);
    }
  }, [isSelected]);

  const materials = catalog?.materials ?? [];

  const roomCost = (room.materials ?? []).reduce((sum, m) => sum + (m.total || m.quantity * m.unit_price), 0);

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

  async function updateMaterialQty(materialId: string, qty: number) {
    if (qty < 0) return;
    const updatedMats = (room.materials ?? []).map((m) => {
      if (m.material_id === materialId) {
        return {
          ...m,
          quantity: qty,
          total: Math.round(qty * m.unit_price * 100) / 100,
        };
      }
      return m;
    });
    await updateRoom({ materials: updatedMats });
  }

  return (
    <div
      id={`room-card-${room.id}`}
      onClick={() => setSelectedRoomId(room.id)}
      className={`p-3 rounded-xl bg-surface-container-lowest border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-md bg-surface-container-low'
          : 'border-outline-variant hover:border-outline'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-body-md font-body-md font-semibold text-on-surface">{room.name}</h4>
            {isSelected && (
              <span className="px-1.5 py-0.2 rounded bg-primary text-on-primary text-[10px] font-bold">
                Ativo no 2D
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant">
            <span>{Math.round(room.area_m2)} m² ({room.width_m}×{room.depth_m}m)</span>
            {roomCost > 0 && (
              <>
                <span>•</span>
                <span className="font-semibold text-secondary">R$ {roomCost.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {saving && <span className="text-[10px] text-on-surface-variant animate-pulse">salvando...</span>}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
          >
            <Icon name={open ? 'expand_less' : 'expand_more'} className="text-[20px]" />
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-3 pt-3 border-t border-outline-variant/40 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1 font-medium">Largura (m)</label>
              <input
                type="number"
                step={0.5}
                min={1}
                max={30}
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
              <label className="text-label-sm text-on-surface-variant block mb-1 font-medium">Profundidade (m)</label>
              <input
                type="number"
                step={0.5}
                min={1}
                max={30}
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
            <label className="text-label-sm text-on-surface-variant block mb-1 font-medium">
              Adicionar material ao ambiente
            </label>
            <select
              value=""
              onChange={(e) => e.target.value && assignMaterial(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-2 py-1.5 text-body-md"
            >
              <option value="">Selecionar material do catálogo...</option>
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
              <span className="text-label-sm font-semibold text-on-surface block">
                Materiais e Quantidades:
              </span>
              {room.materials.map((m) => (
                <div
                  key={m.material_id}
                  className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-body-sm font-semibold text-on-surface block">{m.name}</span>
                      <span className="text-[11px] text-on-surface-variant">
                        Categoria: {m.category} • R$ {m.unit_price.toFixed(2)} / {m.unit}
                      </span>
                    </div>
                    <button
                      onClick={() => removeRoomMaterial(m.material_id)}
                      className="p-1 rounded hover:bg-error-container text-error"
                      title="Remover material"
                    >
                      <Icon name="delete" className="text-[16px]" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-outline-variant/30">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] text-on-surface-variant">Qtd ({m.unit}):</label>
                      <input
                        type="number"
                        step={1}
                        min={0.1}
                        value={m.quantity}
                        onChange={(e) => updateMaterialQty(m.material_id, Number(e.target.value))}
                        className="w-20 bg-surface-container-lowest border border-outline-variant rounded px-1.5 py-0.5 text-xs font-semibold text-on-surface"
                      />
                    </div>
                    <span className="text-xs font-bold text-secondary">
                      R$ {(m.total || m.quantity * m.unit_price).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
