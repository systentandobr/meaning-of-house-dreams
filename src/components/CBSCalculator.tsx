import { Icon } from './Icon';
import type { Project } from '../domain/project';

interface CBSCalculatorProps {
  project: Project;
}

export function CBSCalculator({ project }: CBSCalculatorProps) {
  // Protótipo: decomposição educacional do CBS consolidado.
  const budgetPerM2 = project.budget > 0 ? project.budget / project.area_m2 : 4120;
  const conventional = 3850;
  const delta = budgetPerM2 - conventional;
  const paybackYears = delta > 0 ? Math.max(2, Math.round((delta / budgetPerM2) * 30)) : 4;
  const economy15 = Math.round(project.area_m2 * 748); // protótipo ~R$748/m² em 15 anos
  const solar = Math.round(economy15 * 0.53);
  const water = Math.round(economy15 * 0.28);
  const durability = economy15 - solar - water;

  return (
    <section
      className="lg:col-span-7 bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-lg shadow-sm"
      id="calculadora-cbs"
    >
      <div className="flex items-center justify-between border-b border-outline-variant/80 pb-space-sm">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
            <Icon name="calculate" className="text-[16px]" />
            Métricas Econômicas & Ecoeficiência
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Calculadora CBS (Custo-Benefício Sustentável)
          </h2>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm font-bold">
          Score {project.cbs.toFixed(1)}
        </span>
      </div>
      <p className="text-body-md font-body-md text-on-surface-variant">
        Análise de retorno financeiro ponderado: o investimento adicional em tecnologias verdes e envoltória
        passiva amortizado pela economia operacional contínua. <strong>Protótipo educacional.</strong>
      </p>

      <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2">
          <div>
            <span className="text-label-sm font-label-sm text-on-surface-variant">
              Economia Operacional Estimada (15 anos)
            </span>
            <div className="text-metric-display font-metric-display text-primary leading-tight font-extrabold">
              R$ {economy15.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Payback Estimado</span>
            <div className="text-headline-md font-headline-md text-secondary font-bold">
              {paybackYears} anos
            </div>
          </div>
        </div>
        <div className="space-y-3 pt-2">
          <BreakdownBar
            label="Geração Solar Fotovoltaica + Ventilação Passiva"
            value={solar}
            total={economy15}
            colorClass="bg-primary"
          />
          <BreakdownBar
            label="Captação Pluvial & Reúso de Águas Cinzas"
            value={water}
            total={economy15}
            colorClass="bg-secondary"
          />
          <BreakdownBar
            label="Durabilidade & Menor Manutenção de Materiais Naturais"
            value={durability}
            total={economy15}
            colorClass="bg-tertiary-container"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60">
          <span className="text-label-sm font-label-sm text-on-surface-variant block">Alvenaria Convencional</span>
          <div className="text-title-lg font-title-lg font-bold text-on-surface mt-0.5">
            R$ {conventional.toLocaleString('pt-BR')} / m²
          </div>
          <p className="text-body-sm font-body-sm text-error mt-1 flex items-center gap-1">
            <Icon name="north_east" className="text-[16px]" />
            Custo energético +65% em 10 anos
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-tertiary-fixed/40 border border-primary-fixed">
          <span className="text-label-sm font-label-sm text-primary font-semibold block">
            Projeto {project.name}
          </span>
          <div className="text-title-lg font-title-lg font-bold text-primary mt-0.5">
            R$ {budgetPerM2.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} / m²
          </div>
          <p className="text-body-sm font-body-sm text-primary font-medium mt-1 flex items-center gap-1">
            <Icon name="south_east" className="text-[16px]" />
            Amortização acelerada em ~{paybackYears * 12} meses
          </p>
        </div>
      </div>
    </section>
  );
}

function BreakdownBar({
  label,
  value,
  total,
  colorClass,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-body-sm font-body-sm mb-1">
        <span className="font-medium text-on-surface flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${colorClass} inline-block`}></span>
          {label}
        </span>
        <span className="font-bold text-on-surface">
          R$ {value.toLocaleString('pt-BR')} ({pct}%)
        </span>
      </div>
      <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
        <div className={`${colorClass} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
