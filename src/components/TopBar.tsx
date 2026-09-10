import { Icon } from './Icon';
import type { Project } from '../domain/project';

interface TopBarProps {
  project: Project | null;
  onNewProject: () => void;
  onExport: () => void;
}

export function TopBar({ project, onNewProject, onExport }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface-container-low border-b border-outline-variant shadow-sm transition-all duration-200">
      <div className="flex justify-between items-center w-full px-gutter-desktop max-w-content-max-width mx-auto h-20">
        <div className="flex items-center gap-space-lg">
          <div className="flex items-center gap-space-xs cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shadow-sm group-hover:bg-primary transition-colors">
              <Icon name="eco" className="text-[24px]" fill />
            </div>
            <div className="flex flex-col">
              <span className="text-title-lg font-title-lg text-primary tracking-tight font-semibold">
                Casa dos Sonhos
              </span>
              <span className="text-label-sm font-label-sm text-secondary tracking-normal flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                Arquitetura Bioclimática
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-outline-variant hidden lg:block"></div>
          <button
            onClick={onNewProject}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant hover:border-outline transition-colors cursor-pointer text-body-sm font-body-sm text-on-surface"
          >
            <Icon name="home_work" className="text-[18px] text-primary" />
            <span className="font-semibold text-on-surface">
              {project ? project.name : 'Novo projeto'}
            </span>
            {project && (
              <span className="text-on-surface-variant font-normal">— {project.area_m2}m²</span>
            )}
            <Icon name="expand_more" className="text-[16px] text-outline ml-1" />
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-space-lg">
          <a className="border-b-2 border-primary text-primary font-title-md text-title-md pb-1" href="#visao-geral">
            Visão Geral
          </a>
          <a className="text-on-surface-variant hover:text-on-surface font-title-md text-title-md pb-1 transition-colors" href="#catalogo">
            Catálogo de Materiais
          </a>
          <a className="text-on-surface-variant hover:text-on-surface font-title-md text-title-md pb-1 transition-colors" href="#calculadora-cbs">
            Calculadora CBS
          </a>
          <a className="text-on-surface-variant hover:text-on-surface font-title-md text-title-md pb-1 transition-colors" href="#indice-igo">
            Índice IGO
          </a>
          <a className="text-on-surface-variant hover:text-on-surface font-title-md text-title-md pb-1 transition-colors" href="#cronograma">
            Cronograma
          </a>
        </nav>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all duration-200 active:scale-[0.98] shadow-sm text-label-md font-label-md font-semibold"
          >
            <Icon name="add" className="text-[18px]" />
            <span>{project ? 'Novo Projeto' : 'Criar Projeto'}</span>
          </button>
          <button
            onClick={onExport}
            disabled={!project}
            className="hidden xl:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container border border-outline-variant hover:border-secondary transition-all text-label-md font-label-md text-on-surface font-medium disabled:opacity-50"
          >
            <Icon name="file_download" className="text-[18px] text-secondary" />
            Exportar Plano
          </button>
        </div>
      </div>
    </header>
  );
}
