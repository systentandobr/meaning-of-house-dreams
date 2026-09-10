import { useEffect, useState } from 'react';
import { useProject } from '../hooks/useProject';
import type { RoomEstimate } from '../services/projectService';

export function RoomBudget() {
  const { project, estimate } = useProject();
  const [estimates, setEstimates] = useState<RoomEstimate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [project?.id, project?.discovery, estimate]);

  const total = estimates.reduce((sum, e) => sum + e.total, 0);

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm" id="orcamento">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Estimativa Inicial de Custos
          </h2>
        </div>
        <div className="text-right">
          <div className="text-title-md font-title-md font-bold text-on-surface">
            R$ {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-label-sm text-on-surface-variant">estimado</div>
        </div>
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Calculando...</p>}
      {error && <p className="text-body-sm text-error">{error}</p>}

      <div className="space-y-3">
        {estimates.map((e) => (
          <div key={e.room_id} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="text-body-md font-body-md font-semibold text-on-surface">{e.room_name}</h4>
                <p className="text-label-sm text-on-surface-variant">{Math.round(e.area_m2)} m²</p>
              </div>
              <span className="text-title-md font-title-md font-bold text-secondary">
                R$ {e.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </span>
            </div>
            {e.items.length > 0 && (
              <ul className="mt-2 space-y-1 pt-2 border-t border-outline-variant/60">
                {e.items.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-body-sm text-on-surface-variant">
                    <span>{item.description}</span>
                    <span className="font-medium text-on-surface">R$ {item.total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <p className="text-label-sm text-on-surface-variant">
        Valores baseados no catálogo local e dimensões. Revisar com profissional e orçamento de fornecedores.
      </p>
    </section>
  );
}
