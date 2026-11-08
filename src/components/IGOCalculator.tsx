import { Icon } from './Icon';
import type { Project } from '../domain/project';

interface IGOCalculatorProps {
  project: Project;
}

const SEALS: Record<string, { label: string; color: string; bg: string }> = {
  ouro: { label: 'Selo Ouro', color: 'text-secondary', bg: 'bg-secondary-fixed text-on-secondary-fixed' },
  prata: { label: 'Selo Prata', color: 'text-primary', bg: 'bg-primary-fixed text-on-primary-fixed' },
  bronze: { label: 'Selo Bronze', color: 'text-on-surface-variant', bg: 'bg-surface-container text-on-surface' },
  revisao: { label: 'Requer Revisão', color: 'text-error', bg: 'bg-error-container text-on-error-container' },
};

export function IGOCalculator({ project }: IGOCalculatorProps) {
  // IGO and every dimension are derived by the backend viability study from
  // real project signals — this component only renders them.
  const viability = project.studies?.viability;
  const score = viability?.igo ?? project.igo ?? 0;
  const selo = SEALS[viability?.seal ?? ''] ?? SEALS[score >= 85 ? 'ouro' : score >= 70 ? 'prata' : score >= 50 ? 'bronze' : 'revisao'];

  return (
    <section
      className="lg:col-span-5 bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-lg shadow-sm"
      id="indice-igo"
    >
      <div className="border-b border-outline-variant/80 pb-space-sm">
        <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
          <Icon name="tune" className="text-[16px]" />
          Viabilidade e Governança
        </div>
        <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Índice IGO de Obra</h2>
      </div>

      <div className="flex items-center gap-space-lg bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant">
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-surface-container"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-primary transition-all duration-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-headline-md font-headline-md font-extrabold text-on-surface">{Math.round(score)}</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Score</span>
          </div>
        </div>
        <div>
          <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-bold ${selo.bg}`}>
            {selo.label}
          </span>
          <h4 className="text-title-md font-title-md font-semibold text-on-surface mt-1">Viabilidade do Projeto</h4>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Índice de Gestão Orçamentária da Obra — derivado dos dados reais do projeto.
          </p>
        </div>
      </div>

      {viability ? (
        <div className="space-y-3">
          {viability.dimensions.map((d) => (
            <div key={d.id} className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60">
              <div className="flex items-center justify-between text-label-md font-label-md">
                <span className="font-semibold text-on-surface">{d.label}</span>
                <span className="font-bold text-primary">
                  {Math.round(d.score)} <span className="text-[10px] font-normal text-on-surface-variant">× {d.weight}</span>
                </span>
              </div>
              <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden mt-1.5">
                <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, d.score)}%` }} />
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1.5">{d.derivation}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-3 rounded-lg bg-surface-container border border-outline-variant text-body-sm text-on-surface-variant">
          Dossiê de viabilidade ainda não disponível — o score acima vem do projeto e será detalhado após o cálculo do backend.
        </p>
      )}

      {viability && viability.findings.length > 0 && (
        <ul className="space-y-1.5 pt-1">
          {viability.findings.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-body-sm text-on-surface-variant">
              <Icon name={f.severity === 'error' ? 'error' : 'info'} className="text-[16px] text-secondary shrink-0 mt-0.5" />
              <span>{f.message}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
