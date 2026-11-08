import { Icon } from './Icon';
import type { Project } from '../domain/project';

interface CBSCalculatorProps {
  project: Project;
}

export function CBSCalculator({ project }: CBSCalculatorProps) {
  // Everything below is backend-computed in project.studies.sustainability —
  // the component renders; it does not estimate.
  const sus = project.studies?.sustainability;
  const economy15 = Math.round(sus?.savings_15y.total ?? 0);
  const solar = Math.round(sus?.savings_15y.solar ?? 0);
  const water = Math.round(sus?.savings_15y.water ?? 0);
  const durability = Math.round(sus?.savings_15y.durability ?? 0);
  const paybackYears = sus?.payback_years ?? 0;
  const conventional = sus?.conventional_cost_per_m2 ?? 0;
  const budgetPerM2 = sus?.project_cost_per_m2 ?? 0;

  const materialsCount = project.materials?.length || project.selected_material_ids?.length || 0;

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
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary text-on-primary text-label-sm font-label-sm font-bold shadow-sm">
            Score {(sus?.cbs_average ?? project.cbs ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      <p className="text-body-md font-body-md text-on-surface-variant leading-relaxed">
        Análise de retorno financeiro ponderado: o investimento em tecnologias passivas e {materialsCount} materiais de baixo impacto amortizado pela economia contínua em energia, água e manutenção.
      </p>

      {!sus && (
        <p className="p-3 rounded-lg bg-surface-container border border-outline-variant text-body-sm text-on-surface-variant">
          Dossiê de engenharia ainda não disponível para este projeto — os valores aparecem após o cálculo do backend.
        </p>
      )}

      <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-2">
          <div>
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">
              Economia Operacional Estimada (15 anos)
            </span>
            <div className="text-metric-display font-metric-display text-primary leading-tight font-extrabold">
              R$ {economy15.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="sm:text-right">
            <span className="text-label-sm font-label-sm text-on-surface-variant font-medium">Payback Amortizado</span>
            <div className="text-headline-md font-headline-md text-secondary font-bold">
              {paybackYears > 0 ? `${paybackYears} anos` : '—'}
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
            label="Durabilidade & Baixa Manutenção de Materiais Naturais"
            value={durability}
            total={economy15}
            colorClass="bg-tertiary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60">
          <span className="text-label-sm font-label-sm text-on-surface-variant block font-medium">Alvenaria Convencional</span>
          <div className="text-title-lg font-title-lg font-bold text-on-surface mt-0.5">
            {conventional > 0 ? `R$ ${conventional.toLocaleString('pt-BR')} / m²` : '—'}
          </div>
          <p className="text-body-sm font-body-sm text-error mt-1 flex items-center gap-1">
            <Icon name="north_east" className="text-[16px]" />
            Custo energético +65% em 10 anos
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-tertiary-fixed/30 border border-primary/30">
          <span className="text-label-sm font-label-sm text-primary font-bold block">
            Projeto {project.name} (Bioclimático)
          </span>
          <div className="text-title-lg font-title-lg font-bold text-primary mt-0.5">
            {budgetPerM2 > 0 ? `R$ ${Math.round(budgetPerM2).toLocaleString('pt-BR')} / m²` : '—'}
          </div>
          <p className="text-body-sm font-body-sm text-primary font-medium mt-1 flex items-center gap-1">
            <Icon name="south_east" className="text-[16px]" />
            {economy15 > 0
              ? `Economia contínua de ~R$ ${Math.round(economy15 / 15).toLocaleString('pt-BR')}/ano`
              : 'Economia calculada pelo dossiê do backend'}
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
        <div className={`${colorClass} h-full rounded-full transition-all duration-300`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
}
