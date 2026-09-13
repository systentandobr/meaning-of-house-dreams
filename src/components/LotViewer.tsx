import { useState, useMemo, Suspense, lazy, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { LotSettingsDrawer } from './LotSettingsDrawer';
import { useProject } from '../hooks/useProject';
import { useAppStore } from '../store/appStore';
import type { Project, Room } from '../domain/project';
import { FloorSelector } from './FloorSelector';

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

const WIND_DIRECTIONS: Record<string, { label: string; angle: number }> = {
  Sudeste: { label: 'SE ➔ NO (Vento Sudeste)', angle: 135 },
  Sul: { label: 'S ➔ N (Vento Sul)', angle: 180 },
  Nordeste: { label: 'E ➔ O (Vento Leste/Alísios)', angle: 90 },
  'Centro-Oeste': { label: 'NE ➔ SO (Vento Nordeste)', angle: 45 },
  Norte: { label: 'E ➔ O (Vento Leste)', angle: 90 },
};

function truncateRoomLabel(value: string, maxChars: number) {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

function roomLabelLayout(room: Room, width: number, height: number, zoom: number) {
  // Labels are rendered inside the zoomed SVG, so counteract the zoom and cap
  // the size: labels must aid alignment, never cover walls or nearby rooms.
  const fontSize = Math.max(3.6, Math.min(6, Math.min(width / 10, height / 5.5))) / zoom;
  const maxChars = Math.max(4, Math.floor((width - 8) / (fontSize * 0.62)));

  return {
    fontSize,
    name: truncateRoomLabel(room.name, maxChars),
    canShowName: width >= 24 && height >= 16,
    canShowArea: width >= 42 && height >= 34,
  };
}

interface SnapResult {
  x: number;
  y: number;
  guideX?: number; // visual guide line X in meters
  guideY?: number; // visual guide line Y in meters
  snapped: boolean;
}

function applyLegoSnap(
  targetX: number,
  targetY: number,
  targetW: number,
  targetD: number,
  currentRoomId: string,
  otherRooms: Room[],
  lotW: number,
  lotD: number,
  frontSetback: number,
  sideSetback: number,
  backSetback: number,
  enabled: boolean,
  wallThickness: number
): SnapResult {
  if (!enabled) {
    // Standard grid snap
    const sx = Math.max(0, Math.min(Math.round(targetX * 2) / 2, lotW - targetW));
    const sy = Math.max(0, Math.min(Math.round(targetY * 2) / 2, lotD - targetD));
    return { x: sx, y: sy, snapped: false };
  }

  const SNAP_THRESHOLD = 0.6; // meters
  let snappedX = targetX;
  let snappedY = targetY;
  let guideX: number | undefined;
  let guideY: number | undefined;
  let snapped = false;

  let minDiffX = SNAP_THRESHOLD;
  let minDiffY = SNAP_THRESHOLD;

  // 1. Snap to setbacks (envelope construtivo)
  if (Math.abs(targetX - sideSetback) < minDiffX) {
    snappedX = sideSetback;
    minDiffX = Math.abs(targetX - sideSetback);
    guideX = sideSetback;
    snapped = true;
  }
  const rightSetbackX = lotW - sideSetback - targetW;
  if (Math.abs(targetX - rightSetbackX) < minDiffX) {
    snappedX = rightSetbackX;
    minDiffX = Math.abs(targetX - rightSetbackX);
    guideX = lotW - sideSetback;
    snapped = true;
  }
  if (Math.abs(targetY - frontSetback) < minDiffY) {
    snappedY = frontSetback;
    minDiffY = Math.abs(targetY - frontSetback);
    guideY = frontSetback;
    snapped = true;
  }
  const backSetbackY = lotD - backSetback - targetD;
  if (Math.abs(targetY - backSetbackY) < minDiffY) {
    snappedY = backSetbackY;
    minDiffY = Math.abs(targetY - backSetbackY);
    guideY = lotD - backSetback;
    snapped = true;
  }

  // 2. Snap to neighbor rooms (Lego Wall-to-Wall Snap with Wall Thickness)
  for (const b of otherRooms) {
    if (b.id === currentRoomId) continue;

    // Horizontal snapping (direct abutting or shared wall margin)
    const rightOfB = b.x + b.width_m;
    if (Math.abs(targetX - rightOfB) < minDiffX) {
      snappedX = rightOfB;
      minDiffX = Math.abs(targetX - rightOfB);
      guideX = rightOfB;
      snapped = true;
    }
    const leftOfB = b.x - targetW;
    if (Math.abs(targetX - leftOfB) < minDiffX) {
      snappedX = leftOfB;
      minDiffX = Math.abs(targetX - leftOfB);
      guideX = b.x;
      snapped = true;
    }
    if (Math.abs(targetX - b.x) < minDiffX) {
      snappedX = b.x;
      minDiffX = Math.abs(targetX - b.x);
      guideX = b.x;
      snapped = true;
    }
    const flushRightB = b.x + b.width_m - targetW;
    if (Math.abs(targetX - flushRightB) < minDiffX) {
      snappedX = flushRightB;
      minDiffX = Math.abs(targetX - flushRightB);
      guideX = b.x + b.width_m;
      snapped = true;
    }

    // Shared wall adjustment if wall thickness is configured (> 0.05m)
    if (wallThickness > 0.05) {
      const sharedRight = b.x + b.width_m - wallThickness;
      if (Math.abs(targetX - sharedRight) < minDiffX * 0.5) {
        snappedX = sharedRight;
        minDiffX = Math.abs(targetX - sharedRight);
        guideX = sharedRight;
        snapped = true;
      }
    }

    // Vertical snapping
    const bottomOfB = b.y + b.depth_m;
    if (Math.abs(targetY - bottomOfB) < minDiffY) {
      snappedY = bottomOfB;
      minDiffY = Math.abs(targetY - bottomOfB);
      guideY = bottomOfB;
      snapped = true;
    }
    const topOfB = b.y - targetD;
    if (Math.abs(targetY - topOfB) < minDiffY) {
      snappedY = topOfB;
      minDiffY = Math.abs(targetY - topOfB);
      guideY = b.y;
      snapped = true;
    }
    if (Math.abs(targetY - b.y) < minDiffY) {
      snappedY = b.y;
      minDiffY = Math.abs(targetY - b.y);
      guideY = b.y;
      snapped = true;
    }
    const flushBottomB = b.y + b.depth_m - targetD;
    if (Math.abs(targetY - flushBottomB) < minDiffY) {
      snappedY = flushBottomB;
      minDiffY = Math.abs(targetY - flushBottomB);
      guideY = b.y + b.depth_m;
      snapped = true;
    }

    // Shared wall adjustment vertically
    if (wallThickness > 0.05) {
      const sharedBottom = b.y + b.depth_m - wallThickness;
      if (Math.abs(targetY - sharedBottom) < minDiffY * 0.5) {
        snappedY = sharedBottom;
        minDiffY = Math.abs(targetY - sharedBottom);
        guideY = sharedBottom;
        snapped = true;
      }
    }
  }

  // Fallback to fine grid if no magnetic contact was made
  if (minDiffX === SNAP_THRESHOLD) {
    snappedX = Math.round(targetX * 4) / 4;
  }
  if (minDiffY === SNAP_THRESHOLD) {
    snappedY = Math.round(targetY * 4) / 4;
  }

  // Clamp inside lot boundaries
  snappedX = Math.max(0, Math.min(snappedX, lotW - targetW));
  snappedY = Math.max(0, Math.min(snappedY, lotD - targetD));

  return {
    x: Math.round(snappedX * 100) / 100,
    y: Math.round(snappedY * 100) / 100,
    guideX,
    guideY,
    snapped,
  };
}

export default function LotViewer({ project }: LotViewerProps) {
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [localRooms, setLocalRooms] = useState<Room[] | null>(null);
  const [pending, setPending] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<Room | null>(null);
  const [activeGuides, setActiveGuides] = useState<{ x?: number; y?: number } | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resizeStartRef = useRef<{ width: number; depth: number; startX: number; startY: number }>({
    width: 0,
    depth: 0,
    startX: 0,
    startY: 0,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { simulate } = useProject();
  const {
    draftProject,
    setDraftProject,
    startSimulation,
    isSimulation,
    selectedRoomId,
    setSelectedRoomId,
    activeFloor,
    magneticSnapEnabled,
    setMagneticSnapEnabled,
    wallThickness,
    setWallThickness,
  } = useAppStore();

  const currentProject = draftProject ?? project;
  const allRooms = localRooms ?? currentProject.room_schedule?.rooms ?? [];

  useEffect(() => {
    setLocalRooms(null);
  }, [currentProject.room_schedule?.rooms]);

  // Scaled dimensions
  const { scale, width, depth, lotX, lotY } = useMemo(() => {
    const w = Math.max(currentProject.lot_width || 12, 1);
    const d = Math.max(currentProject.lot_depth || 25, 1);
    const maxPx = 340;
    const s = Math.min(maxPx / w, 240 / d);
    const lw = w * s;
    const ld = d * s;
    return { scale: s, width: lw, depth: ld, lotX: (400 - lw) / 2, lotY: (320 - ld) / 2 + 5 };
  }, [currentProject.lot_width, currentProject.lot_depth]);

  // Setbacks envelope
  const setbacks = useMemo(() => {
    const front = currentProject.front_setback || 3.0;
    const side = currentProject.side_setback || 1.5;
    const back = currentProject.back_setback || 1.5;
    const sx = lotX + side * scale;
    const sy = lotY + front * scale;
    const sw = Math.max(0, (currentProject.lot_width - 2 * side) * scale);
    const sd = Math.max(0, (currentProject.lot_depth - front - back) * scale);
    return { front, side, back, sx, sy, sw, sd };
  }, [currentProject.front_setback, currentProject.side_setback, currentProject.back_setback, currentProject.lot_width, currentProject.lot_depth, lotX, lotY, scale]);

  // Filtered rooms for active floor
  const rooms = useMemo(() => {
    if (activeFloor === 0) return allRooms.filter((r) => r.floor === 0);
    return allRooms.filter((r) => r.floor === activeFloor);
  }, [allRooms, activeFloor]);

  // Conflicts calculation
  const conflicts = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < rooms.length; i++) {
      const a = rooms[i];
      if (a.floor === 0) continue;
      const frontM = currentProject.front_setback || 3.0;
      const sideM = currentProject.side_setback || 1.5;
      const backM = currentProject.back_setback || 1.5;
      const maxAllowedX = currentProject.lot_width - sideM;
      const maxAllowedY = currentProject.lot_depth - backM;

      if (a.x < sideM || a.y < frontM || a.x + a.width_m > maxAllowedX || a.y + a.depth_m > maxAllowedY) {
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
  }, [rooms, currentProject.front_setback, currentProject.side_setback, currentProject.back_setback, currentProject.lot_width, currentProject.lot_depth]);

  // Metrics
  const lotArea = currentProject.lot_area_m2 || currentProject.lot_width * currentProject.lot_depth;
  const floorArea = rooms.reduce((sum, r) => sum + r.area_m2, 0);
  const occupancyRate = lotArea > 0 ? Math.round((currentProject.built_area_m2 / lotArea) * 100) : 0;
  const permeableRate = lotArea > 0 ? Math.round(((currentProject.garden_area_m2 || lotArea * 0.3) / lotArea) * 100) : 30;

  const windInfo = WIND_DIRECTIONS[currentProject.region] || WIND_DIRECTIONS['Sudeste'];

  function toSvgM(screenX: number) {
    const basePx = (screenX - 200 - pan.x) / zoom + 200;
    return (basePx - lotX) / scale;
  }

  function toSvgMY(screenY: number) {
    const basePy = (screenY - 160 - pan.y) / zoom + 160;
    return (basePy - lotY) / scale;
  }

  function toSvgPx(m: number) {
    return lotX + m * scale;
  }

  function toSvgPy(m: number) {
    return lotY + m * scale;
  }

  function mousePos(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left) * (400 / rect.width),
      y: (e.clientY - rect.top) * (320 / rect.height),
    };
  }

  function handleBgMouseDown(e: React.MouseEvent) {
    if (dragging || resizing) return;
    const pos = mousePos(e);
    setIsPanning(true);
    panStartRef.current = {
      x: pos.x,
      y: pos.y,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  }

  function startDrag(e: React.MouseEvent, room: Room) {
    e.preventDefault();
    e.stopPropagation();
    const pos = mousePos(e);
    const clickX_m = toSvgM(pos.x);
    const clickY_m = toSvgMY(pos.y);
    dragOffsetRef.current = {
      x: clickX_m - room.x,
      y: clickY_m - room.y,
    };
    setDragging(room.id);
    setSelectedRoomId(room.id);
    setHoveredRoom(null);
  }

  function startResize(e: React.MouseEvent, room: Room) {
    e.preventDefault();
    e.stopPropagation();
    const pos = mousePos(e);
    resizeStartRef.current = {
      width: room.width_m,
      depth: room.depth_m,
      startX: toSvgM(pos.x),
      startY: toSvgMY(pos.y),
    };
    setResizing(room.id);
    setSelectedRoomId(room.id);
    setHoveredRoom(null);
  }

  async function sendSimulation(updatedRooms: Room[], autoArrange = false) {
    setPending(true);
    try {
      const p = await simulate(currentProject.id, {
        room_schedule: { ...currentProject.room_schedule, rooms: updatedRooms },
        auto_arrange: autoArrange,
      });
      setDraftProject(p);
      if (!isSimulation) startSimulation(p);
    } catch (e: any) {
      console.error(e);
    } finally {
      setPending(false);
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    const pos = mousePos(e);

    if (isPanning) {
      const dx = pos.x - panStartRef.current.x;
      const dy = pos.y - panStartRef.current.y;
      setPan({
        x: Math.round((panStartRef.current.startPanX + dx) * 10) / 10,
        y: Math.round((panStartRef.current.startPanY + dy) * 10) / 10,
      });
      return;
    }

    if (!dragging && !resizing) return;

    if (dragging) {
      const room = allRooms.find((r) => r.id === dragging);
      if (!room) return;
      const rawX = toSvgM(pos.x) - dragOffsetRef.current.x;
      const rawY = toSvgMY(pos.y) - dragOffsetRef.current.y;
      const snapRes = applyLegoSnap(
        rawX,
        rawY,
        room.width_m,
        room.depth_m,
        room.id,
        rooms,
        currentProject.lot_width,
        currentProject.lot_depth,
        currentProject.front_setback || 3,
        currentProject.side_setback || 1.5,
        currentProject.back_setback || 1.5,
        magneticSnapEnabled,
        wallThickness
      );
      if (snapRes.snapped) {
        setActiveGuides({ x: snapRes.guideX, y: snapRes.guideY });
      } else {
        setActiveGuides(null);
      }
      const updated = allRooms.map((r) => (r.id === dragging ? { ...r, x: snapRes.x, y: snapRes.y } : r));
      setLocalRooms(updated);
    }

    if (resizing) {
      const room = allRooms.find((r) => r.id === resizing);
      if (!room) return;
      const rawW = toSvgM(pos.x) - room.x;
      const rawD = toSvgMY(pos.y) - room.y;
      const w = Math.max(1, Math.round(rawW * 2) / 2);
      const d = Math.max(1, Math.round(rawD * 2) / 2);
      const updated = allRooms.map((r) =>
        r.id === resizing ? { ...r, width_m: w, depth_m: d, area_m2: Math.round(w * d * 100) / 100 } : r
      );
      setLocalRooms(updated);
    }
  }

  function onMouseUp() {
    if (isPanning) {
      setIsPanning(false);
    }
    setActiveGuides(null);
    if (!dragging && !resizing) return;
    if (localRooms) {
      sendSimulation(localRooms);
    }
    setDragging(null);
    setResizing(null);
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((z) => Math.max(0.6, Math.min(2.2, Math.round((z + delta) * 100) / 100)));
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(2.2, Math.round((z + 0.2) * 10) / 10));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 10) / 10));
  }

  function handleZoomReset() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function handleAutoArrange() {
    sendSimulation(allRooms, true);
  }

  function handleRotate(roomId: string) {
    const updated = allRooms.map((r) => {
      if (r.id === roomId) {
        return {
          ...r,
          width_m: r.depth_m,
          depth_m: r.width_m,
          area_m2: Math.round(r.width_m * r.depth_m * 100) / 100,
        };
      }
      return r;
    });
    setLocalRooms(updated);
    sendSimulation(updated);
  }

  function handleDeleteRoom(roomId: string) {
    const updated = allRooms.filter((r) => r.id !== roomId);
    setLocalRooms(updated);
    sendSimulation(updated);
    setSelectedRoomId(null);
  }

  function scrollToRoomCard(roomId: string) {
    setSelectedRoomId(roomId);
    const el = document.getElementById(`room-card-${roomId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const activeRoomObj = allRooms.find((r) => r.id === selectedRoomId);

  return (
    <section className="space-y-4" id="lote">
      {/* Header with Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
            <Icon name="grid_view" className="text-[16px]" />
            Planta & Layout do Terreno
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Visualizador 2D do Lote
          </h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Lote: {currentProject.lot_width}m × {currentProject.lot_depth}m ({Math.round(lotArea)}m²) • Encaixe de Paredes ({Math.round(wallThickness * 100)}cm)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Magnetic Wall Snap Toggle */}
          <button
            onClick={() => setMagneticSnapEnabled(!magneticSnapEnabled)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-label-sm font-semibold transition-colors ${
              magneticSnapEnabled
                ? 'bg-primary-fixed text-on-primary-fixed border-primary shadow-sm'
                : 'bg-surface-container text-on-surface-variant border-outline-variant'
            }`}
            title="Ativar/Desativar Encaixe Magnético de Paredes (Lego Snap)"
          >
            <Icon name="straighten" className="text-[16px]" />
            <span>{magneticSnapEnabled ? 'Snap: Ativo' : 'Snap: Livre'}</span>
          </button>

          <button
            onClick={handleAutoArrange}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-body-sm hover:border-primary disabled:opacity-60 font-medium"
            title="Auto-organizar cômodos dentro do envelope construtivo"
          >
            <Icon name="auto_awesome_mosaic" className="text-[16px]" />
            Rearranjar
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg bg-surface-container border border-outline-variant hover:border-primary text-primary"
            title="Configurar dimensões, recuos e espessura de paredes"
          >
            <Icon name="tune" className="text-[18px]" />
          </button>
          <div className="flex bg-surface-container rounded-lg p-0.5 border border-outline-variant">
            <button
              onClick={() => setView('2d')}
              className={`px-3 py-1 rounded-md text-label-sm font-semibold transition-colors ${
                view === '2d' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              2D
            </button>
            <button
              onClick={() => setView('3d')}
              className={`px-3 py-1 rounded-md text-label-sm font-semibold transition-colors ${
                view === '3d' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              3D
            </button>
          </div>
        </div>
      </div>

      {/* KPI Ribbons & Floor Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-surface-container-low rounded-xl border border-outline-variant">
        {/* Floor Tabs & Wall Thickness Setup */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <FloorSelector project={currentProject} compact />

          {/* Quick Wall Thickness Selector */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-outline-variant/60 text-label-sm">
            <span className="text-[11px] text-on-surface-variant font-medium">Paredes:</span>
            <select
              value={wallThickness}
              onChange={(e) => setWallThickness(Number(e.target.value))}
              className="bg-surface-container border border-outline-variant rounded px-1.5 py-0.5 text-xs font-semibold text-on-surface focus:outline-none"
              title="Espessura padrão das paredes para engenharia estrutural"
            >
              <option value={0.15}>15cm (NBR Convencional)</option>
              <option value={0.20}>20cm (Solo-Cimento/Bio)</option>
              <option value={0.10}>10cm (Drywall/Divisória)</option>
              <option value={0.25}>25cm (Inércia Térmica)</option>
            </select>
          </div>
        </div>

        {/* Real-time KPI Badges */}
        <div className="flex items-center gap-3 text-label-sm">
          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant">Taxa de Ocupação:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full ${
                occupancyRate <= 50
                  ? 'bg-primary-fixed text-on-primary-fixed'
                  : occupancyRate <= 70
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : 'bg-error-container text-on-error-container'
              }`}
            >
              {occupancyRate}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-on-surface-variant">Área Permeável:</span>
            <span className="font-bold text-primary">{permeableRate}%</span>
          </div>
          <div className="flex items-center gap-1 hidden md:flex">
            <span className="text-on-surface-variant">Área Pavimento:</span>
            <span className="font-bold text-on-surface">{Math.round(floorArea)} m²</span>
          </div>
        </div>
      </div>

      {view === '2d' ? (
        <div className="relative overflow-hidden rounded-xl border border-outline-variant bg-[#fdfbf7] dark:bg-[#1a1816]">
          {/* Zoom & Pan Overlay Toolbar */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-surface-container-lowest/90 backdrop-blur-md p-1 rounded-lg border border-outline-variant shadow-md">
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-surface-container text-on-surface"
              title="Aproximar (Zoom In)"
            >
              <Icon name="add" className="text-[18px]" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-surface-container text-on-surface"
              title="Afastar (Zoom Out)"
            >
              <Icon name="remove" className="text-[18px]" />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-primary hover:bg-surface-container"
              title="Ajustar zoom e centralizar (100%)"
            >
              {Math.round(zoom * 100)}%
            </button>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 400 320"
            onMouseDown={handleBgMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={handleWheel}
            className={`w-full max-w-2xl select-none ${isPanning ? 'cursor-grabbing' : 'cursor-default'}`}
            style={{ minHeight: 320 }}
          >
            <defs>
              <marker id="arrow-n" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L8,3 z" fill="#ba1a1a" />
              </marker>
              <marker id="arrow-wind" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L8,3 z" fill="#006495" />
              </marker>
              <pattern id="lot-grid" width={0.5 * scale * 2} height={0.5 * scale * 2} patternUnits="userSpaceOnUse">
                <path d={`M ${0.5 * scale * 2} 0 L 0 0 0 ${0.5 * scale * 2}`} fill="none" stroke="#e6e1d9" strokeWidth="0.5" />
              </pattern>
            </defs>

            {/* Transform Container with Zoom & Pan */}
            <g transform={`translate(${200 + pan.x}, ${160 + pan.y}) scale(${zoom}) translate(-200, -160)`}>
              {/* Lot boundary and grid */}
              <rect x={lotX} y={lotY} width={width} height={depth} fill="#f4eee4" stroke="#767870" strokeWidth="2" />
              <rect x={lotX} y={lotY} width={width} height={depth} fill="url(#lot-grid)" />

              {/* Setback envelope (dashed boundary) */}
              <rect
                x={setbacks.sx}
                y={setbacks.sy}
                width={setbacks.sw}
                height={setbacks.sd}
                fill="#e8f5e9"
                fillOpacity="0.4"
                stroke="#3a4f41"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={setbacks.sx + 4} y={setbacks.sy + 12} fontSize="8" fill="#3a4f41" fontWeight="bold">
                Envelope Construtivo (Recuos)
              </text>

              {/* Active Magnetic Guide Lines */}
              {activeGuides?.x !== undefined && (
                <line
                  x1={toSvgPx(activeGuides.x)}
                  y1={lotY}
                  x2={toSvgPx(activeGuides.x)}
                  y2={lotY + depth}
                  stroke="#2e7d32"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}
              {activeGuides?.y !== undefined && (
                <line
                  x1={lotX}
                  y1={toSvgPy(activeGuides.y)}
                  x2={lotX + width}
                  y2={toSvgPy(activeGuides.y)}
                  stroke="#2e7d32"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Sun Trajectory Arc (East to West) */}
              <path
                d={`M ${lotX + width + 15} ${lotY + depth / 2} A 160 160 0 0 0 ${lotX - 15} ${lotY + depth / 2}`}
                fill="none"
                stroke="#e5a100"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.7"
              />
              <g transform={`translate(${lotX + width + 15}, ${lotY + depth / 2})`}>
                <circle r="6" fill="#e5a100" />
                <text x="8" y="3" fontSize="8" fill="#b27d00" fontWeight="bold">Leste (Manhã)</text>
              </g>
              <g transform={`translate(${lotX - 15}, ${lotY + depth / 2})`}>
                <circle r="6" fill="#d97706" />
                <text x="-58" y="3" fontSize="8" fill="#b45309" fontWeight="bold">Oeste (Tarde)</text>
              </g>

              {/* Predominant Wind Vector */}
              <g transform={`translate(${lotX + 25}, ${lotY + depth - 20}) rotate(${windInfo.angle})`}>
                <line x1="0" y1="0" x2="25" y2="0" stroke="#006495" strokeWidth="2" markerEnd="url(#arrow-wind)" />
                <text x="30" y="3" fontSize="7" fill="#006495" fontWeight="bold">Vento ({windInfo.label.split(' ')[0]})</text>
              </g>

              {/* Compass Rose / North Indicator */}
              <g transform={`translate(${lotX + width - 25}, ${lotY + 25})`}>
                <circle r="14" fill="#ffffff" stroke="#767870" strokeWidth="1" opacity="0.9" />
                <line x1="0" y1="12" x2="0" y2="-12" stroke="#ba1a1a" strokeWidth="2" markerEnd="url(#arrow-n)" />
                <line x1="-10" y1="0" x2="10" y2="0" stroke="#767870" strokeWidth="1" />
                <text x="-3" y="-14" fontSize="8" fill="#ba1a1a" fontWeight="bold">N</text>
                <text x="-3" y="20" fontSize="7" fill="#767870">S</text>
                <text x="13" y="3" fontSize="7" fill="#767870">L</text>
                <text x="-19" y="3" fontSize="7" fill="#767870">O</text>
              </g>

              {/* Render Rooms */}
              {rooms.map((room) => {
                const x = toSvgPx(room.x);
                const y = toSvgPy(room.y);
                const w = room.width_m * scale;
                const h = room.depth_m * scale;
                const hasConflict = conflicts.has(room.id);
                const isSelected = selectedRoomId === room.id;
                const isHovered = hoveredRoom?.id === room.id && !dragging && !resizing;
                const label = roomLabelLayout(room, w, h, zoom);

                return (
                  <g
                    key={room.id}
                    onMouseDown={(e) => startDrag(e, room)}
                    onMouseEnter={() => {
                      if (!dragging && !resizing) {
                        setHoveredRoom(room);
                      }
                    }}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoomId(room.id);
                    }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      fill={ROOM_COLORS[room.type] || '#ffffff'}
                      stroke={isSelected ? '#3a4f41' : hasConflict ? '#ba1a1a' : isHovered ? '#1e1b15' : '#767870'}
                      strokeWidth={isSelected ? 3 : hasConflict ? 2 : 1}
                      strokeDasharray={hasConflict ? '4 2' : 'none'}
                      rx="3"
                      style={{
                        cursor: dragging === room.id ? 'grabbing' : 'grab',
                        filter: isSelected ? 'drop-shadow(0 2px 5px rgba(0,0,0,0.2))' : 'none',
                      }}
                    />

                    {/* Compact labels are clipped to their own room. Full dimensions remain in the status bar/card. */}
                    {label.canShowName && (
                      <g className="select-none pointer-events-none">
                        <clipPath id={`room-label-${room.id}`}>
                          <rect x={x + 3} y={y + 3} width={Math.max(0, w - 6)} height={Math.max(0, h - 6)} rx="1" />
                        </clipPath>
                        <g clipPath={`url(#room-label-${room.id})`}>
                        <text
                          x={x + 4}
                          y={y + label.fontSize + 5}
                          fontSize={label.fontSize}
                          fontWeight="600"
                          fill="#1e1b15"
                        >
                          {label.name}
                        </text>
                        {label.canShowArea && (
                          <text
                            x={x + 4}
                            y={y + label.fontSize * 2 + 7}
                            fontSize={Math.max(3.2, label.fontSize * 0.82)}
                            fill="#454840"
                          >
                            {Math.round(room.area_m2)} m²
                          </text>
                        )}
                        </g>
                      </g>
                    )}

                    {/* Resize handle on selected room */}
                    {isSelected && (
                      <circle
                        cx={x + w - 6}
                        cy={y + h - 6}
                        r={5}
                        fill="#3a4f41"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        style={{ cursor: 'se-resize' }}
                        onMouseDown={(e) => startResize(e, room)}
                      />
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Integrated Unobtrusive Status Bar */}
          <div className="p-2.5 bg-surface-container-lowest border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
            {hoveredRoom ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-bold text-on-surface">{hoveredRoom.name}</span>
                <span>•</span>
                <span>{hoveredRoom.width_m}m × {hoveredRoom.depth_m}m ({Math.round(hoveredRoom.area_m2)} m²)</span>
                <span>•</span>
                <span className="text-secondary font-semibold">
                  {hoveredRoom.materials && hoveredRoom.materials.length > 0
                    ? `${hoveredRoom.materials.length} materiais associados`
                    : 'Sem materiais manuais'}
                </span>
              </div>
            ) : (
              <span className="italic text-[11px] truncate">
                💡 {magneticSnapEnabled ? 'Encaixe magnético ativo: paredes de cômodos e recuos se alinham automaticamente.' : 'Encaixe livre: use o botão Snap para ativar o alinhamento de paredes.'}
              </span>
            )}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono opacity-80">Paredes: {Math.round(wallThickness * 100)}cm</span>
              <span className="text-[10px] font-mono opacity-80">Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>

          {/* Floating Contextual Toolbar for Active Room */}
          {activeRoomObj && (
            <div className="p-3 bg-surface-container border-t border-outline-variant flex flex-wrap items-center justify-between gap-2 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-body-md font-bold text-on-surface">{activeRoomObj.name}</span>
                <span className="text-label-sm text-on-surface-variant">
                  ({activeRoomObj.width_m}m × {activeRoomObj.depth_m}m = {Math.round(activeRoomObj.area_m2)}m²)
                </span>
                {conflicts.has(activeRoomObj.id) && (
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[10px] font-bold">
                    Fora do Recuo / Sobreposição
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRotate(activeRoomObj.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant hover:border-primary text-label-sm font-semibold"
                  title="Girar 90 graus"
                >
                  <Icon name="rotate_right" className="text-[16px]" />
                  Girar 90°
                </button>
                <button
                  onClick={() => scrollToRoomCard(activeRoomObj.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-on-secondary text-label-sm font-semibold shadow-sm"
                  title="Rolar a página até o card de materiais deste cômodo"
                >
                  <Icon name="tune" className="text-[16px]" />
                  Ver Card
                </button>
                <button
                  onClick={() => handleDeleteRoom(activeRoomObj.id)}
                  className="p-1.5 rounded-lg bg-error text-on-error hover:bg-error-container text-label-sm font-semibold"
                  title="Excluir cômodo"
                >
                  <Icon name="delete" className="text-[16px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-2xl rounded-xl border border-outline-variant overflow-hidden bg-surface-container-low">
          <Suspense fallback={<p className="p-4 text-body-sm text-on-surface-variant">Carregando visualizador 3D...</p>}>
            <LotViewer3D project={currentProject} />
          </Suspense>
        </div>
      )}

      {/* Drawer */}
      <LotSettingsDrawer project={currentProject} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
