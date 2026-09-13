import { Icon } from './Icon';
import { RoomEditorCard } from './RoomEditorCard';
import type { Project, Room } from '../domain/project';
import { FloorSelector } from './FloorSelector';
import { useAppStore } from '../store/appStore';

interface RoomScheduleProps {
  project: Project;
}

export function RoomSchedule({ project }: RoomScheduleProps) {
  const schedule = project.room_schedule;
  const rooms = schedule?.rooms ?? [];
  const activeFloor = useAppStore((state) => state.activeFloor);

  const firstFloor = rooms.filter((r) => r.floor === 1);
  const secondFloor = rooms.filter((r) => r.floor === 2);
  const outdoor = rooms.filter((r) => r.floor === 0);

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm" id="planta">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
            <Icon name="floor_plan" className="text-[16px]" />
            Programa de Necessidades
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Cômodos sugeridos a partir do seu sonho
          </h2>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-title-md font-title-md font-bold text-on-surface">{Math.round(schedule?.total_area_m2 ?? 0)} m²</div>
          <div className="text-label-sm text-on-surface-variant">área útil estimada</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniKpi label="Social" value={Math.round(schedule?.living_area_m2 ?? 0)} unit="m²" />
        <MiniKpi label="Serviço" value={Math.round(schedule?.service_area_m2 ?? 0)} unit="m²" />
        <MiniKpi label="Externa" value={Math.round(schedule?.outdoor_area_m2 ?? 0)} unit="m²" />
        <MiniKpi label="Circulação" value={Math.round(schedule?.circulation_area_m2 ?? 0)} unit="m²" />
      </div>

      <p className="text-body-sm font-body-sm text-on-surface-variant">{schedule?.notes}</p>
      <FloorSelector project={project} compact />
      {activeFloor === 1 && <FloorSection title="Térreo / Primeiro pavimento" rooms={firstFloor} project={project} />}
      {activeFloor === 2 && <FloorSection title="Segundo pavimento" rooms={secondFloor} project={project} />}
      {activeFloor === 0 && <FloorSection title="Áreas externas" rooms={outdoor} project={project} />}
    </section>
  );
}

function FloorSection({ title, rooms, project }: { title: string; rooms: Room[]; project: Project }) {
  return (
    <div className="space-y-2">
      <h3 className="text-title-md font-title-md font-semibold text-on-surface flex items-center gap-2">
        <Icon name="layers" className="text-[18px] text-primary" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
        {rooms.map((room) => (
          <RoomEditorCard key={room.id} project={project} room={room} />
        ))}
      </div>
    </div>
  );
}

function MiniKpi({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface-container border border-outline-variant">
      <span className="text-label-sm text-on-surface-variant block">{label}</span>
      <span className="text-title-md font-title-md font-bold text-on-surface">{value} <span className="text-body-sm font-normal text-on-surface-variant">{unit}</span></span>
    </div>
  );
}
