import { useState, useMemo, Suspense, lazy } from 'react';
import type { Project } from '../domain/project';

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

  const { scale, width, depth } = useMemo(() => {
    const w = Math.max(project.lot_width || 12, 1);
    const d = Math.max(project.lot_depth || 25, 1);
    const maxPx = 360;
    const s = Math.min(maxPx / w, 260 / d);
    return { scale: s, width: w * s, depth: d * s };
  }, [project.lot_width, project.lot_depth]);

  const rooms = project.room_schedule?.rooms ?? [];
  const lotX = (400 - width) / 2;
  const lotY = (300 - depth) / 2;

  return (
    <section className="space-y-4" id="lote">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Visualizador do lote</h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Lote: {project.lot_width}m × {project.lot_depth}m ({Math.round(project.lot_area_m2)}m²)
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('2d')} disabled={view === '2d'} className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-body-sm disabled:opacity-50">
            2D
          </button>
          <button onClick={() => setView('3d')} disabled={view === '3d'} className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-body-sm disabled:opacity-50">
            3D
          </button>
        </div>
      </div>

      {view === '2d' ? (
        <svg viewBox="0 0 400 300" className="w-full max-w-2xl bg-surface-container-low rounded-xl border border-outline-variant" style={{ minHeight: 300 }}>
          {/* Lot */}
          <rect x={lotX} y={lotY} width={width} height={depth} fill="#f0e9df" stroke="#767870" strokeWidth="2" />

          {/* Rooms */}
          {rooms.map((room) => {
            if (room.floor === 0 || room.floor === 2) return null; // Only first floor for 2D preview
            const x = lotX + room.x * scale;
            const y = lotY + room.y * scale;
            const w = room.width_m * scale;
            const h = room.depth_m * scale;
            if (x + w > lotX + width || y + h > lotY + depth) return null;
            return (
              <g key={room.id}>
                <rect x={x} y={y} width={w} height={h} fill={ROOM_COLORS[room.type] || '#ffffff'} stroke="#4a463f" strokeWidth="1" rx="2" />
                {w > 40 && h > 20 && (
                  <>
                    <text x={x + 4} y={y + 14} fontSize="10" fill="#1e1b15">{room.name}</text>
                    <text x={x + 4} y={y + 26} fontSize="9" fill="#454840">{Math.round(room.area_m2)}m²</text>
                  </>
                )}
              </g>
            );
          })}

          {/* North arrow */}
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
            <LotViewer3D project={project} />
          </Suspense>
        </div>
      )}
    </section>
  );
}
