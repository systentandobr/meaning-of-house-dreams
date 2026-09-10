import { Icon } from './Icon';
import type { Project } from '../domain/project';

interface HeroOverviewProps {
  project: Project;
  region: string;
  onRegionChange: (r: string) => void;
  regions: string[];
}

const REGION_LABELS: Record<string, string> = {
  Sudeste: 'Sudeste — Serra / Litoral (ZB-3)',
  'Centro-Oeste': 'Centro-Oeste — Cerrado (ZB-4 / ZB-5)',
  Sul: 'Sul — Subtropical (ZB-1 / ZB-2)',
  Nordeste: 'Nordeste — Semiárido / Costa (ZB-6 / ZB-8)',
  Norte: 'Norte — Amazônia / Equatorial (ZB-7)',
};

function cbsGrade(score: number): string {
  if (score >= 80) return 'A+';
  if (score >= 65) return 'A';
  if (score >= 50) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

function igoSelo(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excelente Viabilidade (Selo Ouro)', color: 'text-secondary' };
  if (score >= 70) return { label: 'Boa Viabilidade (Selo Prata)', color: 'text-primary' };
  if (score >= 50) return { label: 'Viabilidade Moderada (Selo Bronze)', color: 'text-on-surface-variant' };
  return { label: 'Requer Revisão', color: 'text-error' };
}

export function HeroOverview({ project, region, onRegionChange, regions }: HeroOverviewProps) {
  const selo = igoSelo(project.igo);
  const certified = project.selected_material_ids.length;
  const co2Estimate = (project.area_m2 * 0.076).toFixed(1); // protótipo: ~76kg CO₂/m² vs alvenaria padrão
  const budgetPerM2 = project.budget > 0 ? project.budget / project.area_m2 : 0;

  return (
    <section
      className="relative overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant p-space-xl subtle-grain"
      id="visao-geral"
    >
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-xl">
        <div className="max-w-2xl space-y-space-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Projeto {project.status} • {project.city || project.region}
          </div>
          <h1 className="text-headline-lg font-headline-lg text-on-surface font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-xl">
            Planejamento integrado de materiais de baixo impacto, cálculo de eficiência bioclimática e
            orçamento consciente para a sua casa sustentável.
          </p>
        </div>

        <div className="w-full lg:w-96 bg-surface-container-lowest rounded-xl border border-outline-variant p-space-md shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="wb_sunny" className="text-[16px]" />
              Contexto Bioclimático
            </span>
            <span className="text-label-sm font-label-sm bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-medium">
              Ativo
            </span>
          </div>
          <div>
            <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">
              Região bioclimática do projeto
            </label>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => onRegionChange(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {REGION_LABELS[r] || r}
                  </option>
                ))}
              </select>
              <Icon name="unfold_more" className="absolute right-3 top-2.5 pointer-events-none text-outline" />
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-surface-container text-label-sm font-label-sm text-on-surface-variant flex flex-col gap-1 border border-outline-variant/60">
            <div className="flex items-center justify-between">
              <span className="font-medium text-on-surface">
                Zona Bioclimática {project.bioclimatic_zone || '—'}
              </span>
              <span className="text-primary font-semibold">{project.city || project.region}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-on-surface-variant text-[12px] pt-1">
              <span className="flex items-center gap-1">
                <Icon name="straighten" className="text-[14px] text-secondary" />
                Lote: {project.lot_width}m × {project.lot_depth}m
              </span>
              <span className="flex items-center gap-1">
                <Icon name="square_foot" className="text-[14px] text-primary" />
                Construída: {project.area_m2} m²
              </span>
              <span className="flex items-center gap-1">
                <Icon name="payments" className="text-[14px] text-primary" />
                R$ {budgetPerM2 > 0 ? budgetPerM2.toFixed(0) : '—'} / m²
              </span>
              {project.garden_area_m2 > 0 && (
                <span className="flex items-center gap-1">
                  <Icon name="nature" className="text-[14px] text-tertiary" />
                  Jardim: {Math.round(project.garden_area_m2)} m²
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-space-xl pt-space-lg border-t border-outline-variant/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <KpiCard
          label="Pegada CO₂ Estimada"
          icon="co2"
          iconClass="text-primary"
          value={`${co2Estimate}`}
          unit="ton CO₂ eq (protótipo)"
          trend={`-42% vs. alvenaria padrão`}
          trendIcon="trending_down"
          trendClass="text-primary"
        />
        <KpiCard
          label="Índice IGO Consolidado"
          icon="verified"
          iconClass="text-secondary"
          value={`${Math.round(project.igo)}`}
          unit="/ 100"
          trend={selo.label}
          trendClass={selo.color}
        />
        <KpiCard
          label="Eficiência CBS"
          icon="energy_savings_leaf"
          iconClass="text-primary"
          value={cbsGrade(project.cbs)}
          unit={`Score ${project.cbs.toFixed(1)}`}
          trend={`Ciclo de 15 anos (protótipo)`}
          trendIcon="savings"
          trendClass="text-primary"
        />
        <KpiCard
          label="Materiais Selecionados"
          icon="nature_people"
          iconClass="text-secondary"
          value={`${certified}`}
          unit="na composição"
          trend={`${project.has_garden ? 'Com jardim nativo' : 'Sem jardim'}`}
          trendClass="text-on-surface-variant"
          progress={Math.min(100, certified * 14)}
        />
      </div>
    </section>
  );
}

interface KpiCardProps {
  label: string;
  icon: string;
  iconClass: string;
  value: string;
  unit: string;
  trend: string;
  trendIcon?: string;
  trendClass: string;
  progress?: number;
}

function KpiCard({ label, icon, iconClass, value, unit, trend, trendIcon, trendClass, progress }: KpiCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant tactile-card flex flex-col justify-between">
      <div className="flex items-center justify-between text-on-surface-variant mb-2">
        <span className="text-label-md font-label-md">{label}</span>
        <Icon name={icon} className={`text-[20px] ${iconClass}`} />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-headline-md font-headline-md font-bold text-on-surface">{value}</span>
          <span className="text-body-sm font-body-sm text-on-surface-variant">{unit}</span>
        </div>
        <div className={`mt-1 inline-flex items-center gap-1 text-label-sm font-label-sm font-semibold ${trendClass}`}>
          {trendIcon && <Icon name={trendIcon} className="text-[14px]" />}
          <span>{trend}</span>
        </div>
        {progress !== undefined && (
          <div className="mt-1 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
