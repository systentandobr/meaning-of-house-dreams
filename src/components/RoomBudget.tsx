import { useEffect, useState, useMemo } from 'react';
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

  useEffect(() => {
    if (!project?.id) return;
    setLoading(true);
    estimate()
      .then((e) => {
        setEstimates(e);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [project?.id, project?.updated_at, estimate]);

  // Derived dynamic room budgets from draftProject if materials are updated
  const computedEstimates = useMemo(() => {
    if (!currentProject) return estimates;

    // Check if rooms have materials assigned
    const rooms = currentProject.room_schedule?.rooms ?? [];
    const list: RoomEstimate[] = [];

    for (const r of rooms) {
      if (r.materials && r.materials.length > 0) {
        const items = r.materials.map((m) => ({
          description: m.name,
          material_id: m.material_id,
          quantity: m.quantity,
          unit: m.unit,
          unit_price: m.unit_price,
          total: m.total || m.quantity * m.unit_price,
          note: `Material aplicado (${m.category})`,
        }));
        const total = items.reduce((s, it) => s + it.total, 0);
        list.push({
          room_id: r.id,
          room_name: r.name,
          area_m2: r.area_m2,
          items,
          total: Math.round(total * 100) / 100,
        });
      }
    }

    // Project-level materials
    if (currentProject.materials && currentProject.materials.length > 0) {
      const generalItems = currentProject.materials.map((pm) => ({
        description: pm.name,
        material_id: pm.material_id,
        quantity: pm.quantity,
        unit: pm.unit,
        unit_price: pm.unit_price,
        total: pm.total || pm.quantity * pm.unit_price,
        note: pm.room_id ? 'Vinculado a ambiente' : 'Material geral do projeto',
      }));
      const genTotal = generalItems.reduce((s, it) => s + it.total, 0);
      list.push({
        room_id: 'geral',
        room_name: 'Materiais Gerais do Projeto',
        area_m2: currentProject.area_m2,
        items: generalItems,
        total: Math.round(genTotal * 100) / 100,
      });
    }

    if (list.length > 0) return list;
    return estimates;
  }, [currentProject, estimates]);

  const total = computedEstimates.reduce((sum, e) => sum + e.total, 0) || currentProject?.budget || 0;

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
