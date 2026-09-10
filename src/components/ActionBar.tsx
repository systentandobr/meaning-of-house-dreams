import { Icon } from './Icon';
import { useProject } from '../hooks/useProject';
import { useAppStore } from '../store/appStore';
import type { Project } from '../domain/project';
import type { Material } from '../domain/material';
import { exportMarkdownPlan } from '../lib/exportPlan';

interface ActionBarProps {
  project: Project | null;
  materials: Material[];
}

export function ActionBar({ project, materials }: ActionBarProps) {
  const { update } = useProject();
  const { draftProject, isSimulation, setDraftProject, stopSimulation } = useAppStore();

  function handleExport() {
    if (!project) return;
    exportMarkdownPlan({
      project,
      materials,
    });
  }

  async function handleSave() {
    if (!project || !draftProject) return;
    await update(project.id, {
      lot_width: draftProject.lot_width,
      lot_depth: draftProject.lot_depth,
      lot_shape: draftProject.lot_shape,
      front_setback: draftProject.front_setback,
      side_setback: draftProject.side_setback,
      back_setback: draftProject.back_setback,
      room_schedule: draftProject.room_schedule,
    });
    setDraftProject(null);
    stopSimulation();
  }

  function handleDiscard() {
    setDraftProject(null);
    stopSimulation();
  }

  const budget = draftProject
    ? `R$ ${(draftProject.budget || 0).toLocaleString('pt-BR')}`
    : project
      ? `R$ ${project.budget.toLocaleString('pt-BR')}`
      : '—';
  const selectedCount = draftProject?.selected_material_ids.length ?? project?.selected_material_ids.length ?? 0;
  const label = draftProject?.name ?? project?.name;

  return (
    <aside className="sticky bottom-0 z-30 bg-surface-container-low/95 backdrop-blur-md border-t border-outline-variant py-3 px-gutter-desktop shadow-md">
      <div className="w-full max-w-content-max-width mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isSimulation ? 'bg-secondary text-on-secondary' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>
            <Icon name={isSimulation ? 'preview' : 'check_circle'} className="text-[20px]" />
          </div>
          <div>
            <div className="text-title-md font-title-md font-semibold text-on-surface">
              {isSimulation
                ? `${label} — Simulação ativa`
                : project
                  ? `${project.name} pronto para emissão de prévia`
                  : 'Crie um projeto para começar'}
            </div>
            <div className="text-body-sm font-body-sm text-on-surface-variant">
              {project
                ? `${selectedCount} materiais selecionados • Orçamento: ${budget}`
                : 'Defina localização, área e sonhos para gerar o plano.'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
          {isSimulation && (
            <>
              <button
                onClick={handleDiscard}
                className="px-4 py-2 rounded-xl bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors text-label-md font-label-md font-medium"
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all duration-200 active:scale-[0.98] shadow-sm text-label-md font-label-md font-bold"
              >
                <Icon name="save" className="text-[20px]" />
                <span>Salvar alterações</span>
              </button>
            </>
          )}
          {!isSimulation && (
            <>
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
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
