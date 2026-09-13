import { useAppStore } from '../store/appStore';
import type { Project } from '../domain/project';

export function FloorSelector({ project, compact = false }: { project: Project; compact?: boolean }) {
  const activeFloor = useAppStore((s) => s.activeFloor);
  const setActiveFloor = useAppStore((s) => s.setActiveFloor);
  const floors = project.floors?.length ? project.floors : [{ number: 1, name: 'Térreo' }, ...(project.stories > 1 ? [{ number: 2, name: '2º pavimento' }] : []), { number: 0, name: 'Áreas externas' }];
  return <div className={`flex gap-2 ${compact ? 'text-xs' : ''}`} role="tablist" aria-label="Selecionar pavimento">
    {floors.map((floor) => <button key={floor.number} type="button" onClick={() => setActiveFloor(floor.number)} className={`rounded-lg border px-3 py-2 font-semibold ${activeFloor === floor.number ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>{floor.name}</button>)}
  </div>;
}
