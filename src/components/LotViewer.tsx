import { useState, useMemo, Suspense, lazy, useRef } from 'react';
import { Icon } from './Icon';
import { LotSettingsDrawer } from './LotSettingsDrawer';
import { useProject } from '../hooks/useProject';
import { useAppStore } from '../store/appStore';
import type { Project, Room } from '../domain/project';

const LotViewer3D = lazy(() => import('./LotViewer3D').then((m) => ({ default: m.LotViewer3D })));

interface LotViewerProps {
  project: Project;
}

const ROOM_COLORS: Record<string, string> = {
  bedroom: '#e8f5e9',
  bathroom: '#e3f2fd',
  kitchen: '#fff3e0',
  living: '#fce4ec',
  dining: '#f3e5f5',
  office: '#e0f7fa',
  laundry: '#f1f8e9',
  storage: '#efebe9',
  garage: '#cfd8dc',
  garden: '#c8e6c9',
  deck: '#d7ccc8',
  terrace: '#ffe0b2',
  corridor: '#f5f5f5',
};

export default function LotViewer({ project }: LotViewerProps) {
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { simulate } = useProject();
  const { draftProject, setDraftProject, startSimulation, isSimulation } = useAppStore();

  const currentProject = draftProject ?? project;

  const { scale, width, depth, lotX, lotY } = useMemo(() => {
    const w = Math.max(currentProject.lot_width || 12, 1);
    const d = Math.max(currentProject.lot_depth || 25, 1);
    const maxPx = 360;
    const s = Math.min(maxPx / w, 260 / d);
    const lw = w * s;
    const ld = d * s;
    return { scale: s, width: lw, depth: ld, lotX: (400 - lw) / 2, lotY: (300 - ld) / 2 };
  }, [currentProject.lot_width, currentProject.lot_depth]);

  const rooms = currentProject.room_schedule?.rooms ?? [];
  const conflicts = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < rooms.length; i++) {
      const a = rooms[i];
      if (a.floor === 0) continue;
      if (a.x < 0 || a.y < 0 || a.x + a.width_m > currentProject.lot_width || a.y + a.depth_m > currentProject.lot_depth) {
        set.add(a.id);
      }
      for (let j = 0; j < rooms.length; j++) {
        if (i === j || rooms[j].floor !== a.floor) continue;
        const b = rooms[j];
        if (a.x < b.x + b.width_m && a.x + a.width_m > b.x && a.y < b.y + b.depth_m && a.y + a.depth_m > b.y) {
          set.add(a.id);
          set.add(b.id);
        }
      }
    }
    return set;
  }, [rooms, currentProject.lot_width, currentProject.lot_depth]);

  function toSvgM(px: number) {
    return (px - lotX) / scale;
  }

  function toSvgPx(m: number) {
    return lotX + m * scale;
  }

  function mousePos(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrag(e: React.MouseEvent, room: Room) {
    e.preventDefault();
    setDragging(room.id);
    setSelectedRoom(room.id);
  }

  function startResize(e: React.MouseEvent, room: Room) {
    e.preventDefault();
    e.stopPropagation();
    setResizing(room.id);
    setSelectedRoom(room.id);
  }

  function applyRoomChanges(updatedRooms: Room[]) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const schedule = { ...currentProject.room_schedule, rooms: updatedRooms };
      simulate(currentProject.id, { room_schedule: schedule })
        .then((p) => {
          setDraftProject(p);
          if (!isSimulation) startSimulation(p);
        })
        .catch((e: any) => console.error(e));
    }, 300);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging && !resizing) return;
    const pos = mousePos(e);
    if (dragging) {
      const room = rooms.find((r) => r.id === dragging);
      if (!room) return;
      const x = Math.max(0, toSvgM(pos.x) - room.width_m / 2);
      const y = Math.max(0, toSvgM(pos.y) - room.depth_m / 2);
      const updated = rooms.map((r) =>
        r.id === dragging ? { ...r, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 } : r
      );
      applyRoomChanges(updated);
    }
    if (resizing) {
      const room = rooms.find((r) => r.id === resizing);
      if (!room) return;
      const w = Math.max(1, toSvgM(pos.x) - room.x);
      const d = Math.max(1, toSvgM(pos.y) - room.y);
      const updated = rooms.map((r) =>
        r.id === resizing
          ? { ...r, width_m: Math.round(w * 10) / 10, depth_m: Math.round(d * 10) / 10 }
          : r
      );
      applyRoomChanges(updated);
    }
  }

  function onMouseUp() {
    setDragging(null);
    setResizing(null);
  }

  function handleAutoArrange() {
    applyRoomChanges(rooms);
  }

  return (
    <section className="space-y-4" id="lote">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Visualizador do lote</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Lote: {currentProject.lot_width}m × {currentProject.lot_depth}m ({Math.round(currentProject.lot_area_m2)}m²)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoArrange}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-body-sm hover:border-primary"
          >
            <Icon name="auto_awesome_mosaic" className="text-[16px]" />
            Rearranjar
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg bg-surface-container border border-outline-variant hover:border-primary"
            title="Configurar terreno"
          >
            <Icon name="settings" className="text-[18px] text-primary" />
          </button>
          <div className="flex gap-2">
            <button onClick={() => setView('2d')} disabled={view === '2d'} className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-body-sm disabled:opacity-50">
              2D
            </button>
            <button onClick={() => setView('3d')} disabled={view === '3d'} className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-body-sm disabled:opacity-50">
              3D
            </button>
          </div>
        </div>
      </div>

      {view === '2d' ? (
        <svg
          ref={svgRef}
          viewBox="0 0 400 300"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          className="w-full max-w-2xl bg-surface-container-low rounded-xl border border-outline-variant cursor-crosshair select-none"
          style={{ minHeight: 300 }}
        >
          <rect x={lotX} y={lotY} width={width} height={depth} fill="#f0e9df" stroke="#767870" strokeWidth="2" />

          {rooms.map((room) => {
            if (room.floor === 0 || room.floor === 2) return null;
            const x = toSvgPx(room.x);
            const y = toSvgPx(room.y);
            const w = room.width_m * scale;
            const h = room.depth_m * scale;
            const hasConflict = conflicts.has(room.id);
            const isSelected = selectedRoom === room.id;
            return (
              <g key={room.id} onMouseDown={(e) => startDrag(e, room)}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={ROOM_COLORS[room.type] || '#ffffff'}
                  stroke={isSelected ? '#3a4f41' : hasConflict ? '#ba1a1a' : '#4a463f'}
                  strokeWidth={isSelected ? 2.5 : 1}
                  rx="2"
                  style={{ cursor: 'grab' }}
                />
                {w > 40 && h > 20 && (
                  <>
                    <text x={x + 4} y={y + 14} fontSize="10" fill="#1e1b15">{room.name}</text>
                    <text x={x + 4} y={y + 26} fontSize="9" fill="#454840">{Math.round(room.area_m2)}m²</text>
                  </>
                )}
                {isSelected && (
                  <circle
                    cx={x + w - 6}
                    cy={y + h - 6}
                    r={5}
                    fill="#3a4f41"
                    style={{ cursor: 'se-resize' }}
                    onMouseDown={(e) => startResize(e, room)}
                  />
                )}
              </g>
            );
          })}

          <line x1={lotX + width - 20} y1={lotY + 20} x2={lotX + width - 20} y2={lotY + 50} stroke="#ba1a1a" strokeWidth="2" markerEnd="url(#arrow)" />
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L9,3 z" fill="#ba1a1a" />
            </marker>
          </defs>
          <text x={lotX + width - 30} y={lotY + 15} fontSize="10" fill="#ba1a1a" fontWeight="bold">N</text>
        </svg>
      ) : (
        <div className="w-full max-w-2xl rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low">
          <Suspense fallback={<p className="p-4 text-body-sm text-on-surface-variant">Carregando visualizador 3D...</p>}>
            <LotViewer3D project={currentProject} />
          </Suspense>
        </div>
      )}

      <LotSettingsDrawer project={currentProject} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
