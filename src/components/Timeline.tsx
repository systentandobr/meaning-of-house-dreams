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
      border: 'border-primary/30',
    };
  }
  if (status === 'in_progress') {
    return {
      class: 'bg-secondary-container text-on-secondary-container',
      icon: 'sync' as const,
      label: 'Em Andamento',
      border: 'border-2 border-secondary',
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

  function handleToggle(phaseId: string, taskId: string, completed: boolean) {
    onToggleTask?.(phaseId, taskId, completed);
  }

  function progress(tasks: Phase['tasks']) {
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
            Sequenciamento de Canteiro Vivo
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Cronograma Verde & Tarefas
          </h2>
        </div>
        <span className="text-label-md font-label-md text-primary font-semibold flex items-center gap-1">
          <Icon name="task_alt" className="text-[18px]" />
          {activePhase
            ? `Etapa ${activePhase.order} • ${activePhase.name}`
            : 'Cronograma a definir'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md pt-space-xs">
        {project.phases.map((phase, index) => {
          const badge = statusBadge(phase.status);
          const active = index === currentPhase;
          const pct = progress(phase.tasks);
          return (
            <div
              key={phase.id}
              className={`p-space-md rounded-xl bg-surface-container-lowest border ${badge.border} ${
                active ? 'shadow-sm opacity-100' : 'opacity-90'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${badge.class}`}>
                  {badge.label}
                </span>
                <Icon name={badge.icon} className="text-[18px] text-primary" fill />
              </div>
              <h4 className="text-title-md font-title-md font-bold text-on-surface">
                {phase.order}. {phase.name}
              </h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">{phase.description}</p>

              <div className="mt-3 w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] text-on-surface-variant mt-1 block">{pct}% concluído</span>

              <span className="text-[12px] text-primary font-semibold block mt-3">
                Mês {String(phase.start_month).padStart(2, '0')} - {String(phase.end_month).padStart(2, '0')}
              </span>
              {phase.sustainability_notes && (
                <p className="text-[11px] text-on-surface-variant mt-2 italic">{phase.sustainability_notes}</p>
              )}

              {onToggleTask && phase.tasks.length > 0 && (
                <div className="mt-4 pt-3 border-t border-outline-variant/60 space-y-2">
                  {phase.tasks.map((task) => (
                    <label key={task.id} className="flex items-center gap-2 text-body-sm text-on-surface cursor-pointer hover:bg-surface-bright p-1.5 rounded">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => handleToggle(phase.id, task.id, e.target.checked)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className={task.completed ? 'line-through text-on-surface-variant' : ''}>{task.name}</span>
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
