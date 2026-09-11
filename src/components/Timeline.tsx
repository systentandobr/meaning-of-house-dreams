import { Icon } from './Icon';
import type { Phase, Project } from '../domain/project';

interface TimelineProps {
  project: Project;
  currentPhase: number;
  onToggleTask?: (phaseId: string, taskId: string, completed: boolean) => void;
}

function statusBadge(status: Phase['status']) {
  if (status === 'completed') {
    return {
      class: 'bg-primary-fixed text-on-primary-fixed',
      icon: 'check_circle' as const,
      label: 'Concluído',
      border: 'border-primary/40',
    };
  }
  if (status === 'in_progress') {
    return {
      class: 'bg-secondary-container text-on-secondary-container',
      icon: 'sync' as const,
      label: 'Em Andamento',
      border: 'border-2 border-secondary shadow-sm',
    };
  }
  return {
    class: 'bg-surface-container text-on-surface-variant',
    icon: 'schedule' as const,
    label: 'Planejado',
    border: 'border-outline-variant',
  };
}

export function Timeline({ project, currentPhase, onToggleTask }: TimelineProps) {
  const activePhase = project.phases[currentPhase] || project.phases[0];
  const totalBudget = project.budget || 250000;

  function handleToggle(phaseId: string, taskId: string, completed: boolean) {
    onToggleTask?.(phaseId, taskId, completed);
  }

  function physicalProgress(tasks: Phase['tasks']) {
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);
  }

  return (
    <section
      className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm"
      id="cronograma"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
            <Icon name="calendar_month" className="text-[16px]" />
            Sequenciamento de Canteiro Vivo & Desembolso
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Cronograma Verde & Curva Financeira
          </h2>
        </div>
        <span className="text-label-md font-label-md text-primary font-semibold flex items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant">
          <Icon name="task_alt" className="text-[18px]" />
          {activePhase ? `Etapa ${activePhase.order} • ${activePhase.name}` : 'Cronograma a definir'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md pt-space-xs">
        {project.phases.map((phase, index) => {
          const badge = statusBadge(phase.status);
          const active = index === currentPhase;
          const physPct = physicalProgress(phase.tasks);
          const phaseBudget = phase.estimated_budget || Math.round(totalBudget * 0.16);
          const budgetPct = totalBudget > 0 ? Math.round((phaseBudget / totalBudget) * 100) : 16;
          const spent = phase.spent_budget || Math.round((physPct / 100) * phaseBudget);

          return (
            <div
              key={phase.id}
              className={`p-space-md rounded-xl bg-surface-container-lowest border ${badge.border} ${
                active ? 'shadow-md ring-1 ring-secondary/30' : 'opacity-95'
              } space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${badge.class}`}>
                  {badge.label}
                </span>
                <div className="flex items-center gap-1 text-label-sm font-bold text-secondary">
                  <span>R$ {phaseBudget.toLocaleString('pt-BR')}</span>
                  <span className="text-[10px] text-on-surface-variant font-normal">({budgetPct}% da obra)</span>
                </div>
              </div>

              <div>
                <h4 className="text-title-md font-title-md font-bold text-on-surface">
                  {phase.order}. {phase.name}
                </h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  {phase.description}
                </p>
              </div>

              {/* Progress & Disbursement Bar */}
              <div className="p-2.5 rounded-lg bg-surface-container border border-outline-variant/50 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">Avanço Físico: {physPct}%</span>
                  <span className="text-on-surface-variant">
                    Desembolso: R$ {spent.toLocaleString('pt-BR')} / R$ {phaseBudget.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${physPct}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                <span className="font-semibold text-primary">
                  Período: Mês {String(phase.start_month).padStart(2, '0')} ➔ Mês {String(phase.end_month).padStart(2, '0')} ({phase.duration_months} {phase.duration_months === 1 ? 'mês' : 'meses'})
                </span>
              </div>

              {phase.sustainability_notes && (
                <div className="p-2 rounded bg-tertiary-fixed/30 text-on-tertiary-fixed text-[11px] flex items-center gap-1.5">
                  <Icon name="eco" className="text-[14px] shrink-0" fill />
                  <span>{phase.sustainability_notes}</span>
                </div>
              )}

              {onToggleTask && phase.tasks.length > 0 && (
                <div className="pt-3 border-t border-outline-variant/60 space-y-1.5">
                  <span className="text-label-sm font-semibold text-on-surface block mb-1">
                    Checklist de Canteiro Vivo ({phase.tasks.filter((t) => t.completed).length}/{phase.tasks.length}):
                  </span>
                  {phase.tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer hover:bg-surface-container/60 p-1.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleToggle(phase.id, task.id, e.target.checked)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className={task.completed ? 'line-through text-on-surface-variant opacity-70' : 'font-medium'}>
                        {task.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
