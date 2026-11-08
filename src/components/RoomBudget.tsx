import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useProject } from '../hooks/useProject';
import { useAppStore } from '../store/appStore';
import type { RoomEstimate } from '../services/projectService';

export function RoomBudget() {
  const { project, estimate } = useProject();
  const { draftProject } = useAppStore();
  const [estimates, setEstimates] = useState<RoomEstimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentProject = draftProject ?? project;
  const budget = currentProject?.studies?.budget;

  // Fallback only: legacy responses without the studies dossier still hit
  // the /estimate endpoint, which runs the same backend engine.
  useEffect(() => {
    if (!project?.id || project.studies?.budget) return;
    setLoading(true);
    estimate()
      .then((e) => {
        setEstimates(e);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [project?.id, project?.updated_at, project?.studies?.budget, estimate]);

  const computedEstimates: RoomEstimate[] = budget
    ? [
        ...budget.per_room.map((r) => ({
          room_id: r.room_id,
          room_name: r.room_name,
          area_m2: r.area_m2,
          items: r.items.map((i) => ({ ...i, material_id: i.material_id ?? '', note: i.note ?? '' })),
          total: r.total,
        })),
        ...(budget.groups
          .filter((g) => g.id === 'materiais_projeto' && g.items.length > 0)
          .map((g) => ({
            room_id: 'geral',
            room_name: g.label,
            area_m2: currentProject?.area_m2 ?? 0,
            items: g.items.map((i) => ({ ...i, material_id: i.material_id ?? '', note: i.note ?? '' })),
            total: g.subtotal,
          })) as RoomEstimate[]),
      ]
    : estimates;

  const total = budget?.total ?? computedEstimates.reduce((sum, e) => sum + e.total, 0);

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm" id="orcamento">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
            <Icon name="calculate" className="text-[16px]" />
            Orçamento por Ambiente
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Estimativa de Custos & Materiais
          </h2>
        </div>
        <div className="text-right">
          <div className="text-title-md font-title-md font-bold text-on-surface">
            R$ {Math.round(total).toLocaleString('pt-BR')}
          </div>
          <div className="text-label-sm text-on-surface-variant">total estimado</div>
        </div>
      </div>

      {loading && computedEstimates.length === 0 && (
        <p className="text-body-sm text-on-surface-variant animate-pulse">Calculando orçamento...</p>
      )}
      {error && <p className="text-body-sm text-error">{error}</p>}

      <div className="space-y-3">
        {computedEstimates.map((e) => (
          <div key={e.room_id} className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-body-md font-body-md font-semibold text-on-surface">{e.room_name}</h4>
                <p className="text-label-sm text-on-surface-variant">{Math.round(e.area_m2)} m²</p>
              </div>
              <span className="text-title-md font-title-md font-bold text-secondary">
                R$ {Math.round(e.total).toLocaleString('pt-BR')}
              </span>
            </div>
            {e.items.length > 0 && (
              <ul className="mt-2.5 space-y-1.5 pt-2.5 border-t border-outline-variant/60">
                {e.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item.description} ({item.quantity} {item.unit})
                    </span>
                    <span className="font-semibold text-on-surface">
                      R$ {Math.round(item.total).toLocaleString('pt-BR')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="text-label-sm font-label-sm text-on-surface-variant">
        Valores baseados no catálogo de materiais regionais e quantitativos paramétricos. Validar com orçamento executivo.
      </p>
    </section>
  );
}
