import { Icon } from './Icon';
import type { Project } from '../domain/project';
import type { Material } from '../domain/material';
import { exportMarkdownPlan } from '../lib/exportPlan';

interface ActionBarProps {
  project: Project | null;
  materials: Material[];
}

export function ActionBar({ project, materials }: ActionBarProps) {
  function handleExport() {
    if (!project) return;
    exportMarkdownPlan({
      project,
      materials,
    });
  }

  const budget = project ? `R$ ${project.budget.toLocaleString('pt-BR')}` : '—';
  const selectedCount = project?.selected_material_ids.length ?? 0;

  return (
    <aside className="sticky bottom-0 z-30 bg-surface-container-low/95 backdrop-blur-md border-t border-outline-variant py-3 px-gutter-desktop shadow-md">
      <div className="w-full max-w-content-max-width mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-bold">
            <Icon name="check_circle" className="text-[20px]" />
          </div>
          <div>
            <div className="text-title-md font-title-md font-semibold text-on-surface">
              {project ? `${project.name} pronto para emissão de prévia` : 'Crie um projeto para começar'}
            </div>
            <div className="text-body-sm font-body-sm text-on-surface-variant">
              {project
                ? `${selectedCount} materiais selecionados • Orçamento: ${budget}`
                : 'Defina localização, área e sonhos para gerar o plano.'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors text-label-md font-label-md font-medium"
          >
            Voltar ao topo
          </button>
          <button
            onClick={handleExport}
            disabled={!project}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all duration-200 active:scale-[0.98] shadow-sm text-label-md font-label-md font-bold disabled:opacity-60"
          >
            <Icon name="download" className="text-[20px]" />
            <span>Exportar Plano (.MD)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
