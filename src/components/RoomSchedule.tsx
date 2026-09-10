import { Icon } from './Icon';
import type { Project, Room } from '../domain/project';

interface RoomScheduleProps {
  project: Project;
}

const TYPE_LABELS: Record<string, string> = {
  bedroom: 'Quarto',
  bathroom: 'Banheiro',
  kitchen: 'Cozinha',
  living: 'Sala de estar',
  dining: 'Sala de jantar',
  office: 'Escritório',
  laundry: 'Lavanderia',
  storage: 'Armazenamento',
  garage: 'Garagem',
  garden: 'Jardim',
  deck: 'Deck',
  terrace: 'Terraço',
  corridor: 'Circulação',
};

export function RoomSchedule({ project }: RoomScheduleProps) {
  const schedule = project.room_schedule;
  const rooms = schedule?.rooms ?? [];

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

      <FloorSection title="Térreo / Primeiro pavimento" rooms={firstFloor} />
      {secondFloor.length > 0 && <FloorSection title="Segundo pavimento" rooms={secondFloor} />}
      {outdoor.length > 0 && <FloorSection title="Áreas externas" rooms={outdoor} />}
    </section>
  );
}

function FloorSection({ title, rooms }: { title: string; rooms: Room[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-title-md font-title-md font-semibold text-on-surface flex items-center gap-2">
        <Icon name="layers" className="text-[18px] text-primary" />
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => (
          <div key={room.id} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant flex items-start justify-between gap-2">
            <div>
              <h4 className="text-body-md font-body-md font-semibold text-on-surface">{room.name}</h4>
              <p className="text-label-sm text-on-surface-variant">{TYPE_LABELS[room.type] || room.type}</p>

            </div>
            <div className="text-right">
              <div className="text-title-md font-title-md font-bold text-secondary">{Math.round(room.area_m2)}</div>
              <div className="text-[10px] text-on-surface-variant">{room.width_m.toFixed(1)}m × {room.depth_m.toFixed(1)}m</div>
            </div>
          </div>
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
