import { useEffect, useState } from 'react';
import { TopBar } from '../components/TopBar';
import { HeroOverview } from '../components/HeroOverview';
import { MaterialCatalog } from '../components/MaterialCatalog';
import { CBSCalculator } from '../components/CBSCalculator';
import { IGOCalculator } from '../components/IGOCalculator';
import { Timeline } from '../components/Timeline';
import { RoomSchedule } from '../components/RoomSchedule';
import LotViewer from '../components/LotViewer';
import { RoomBudget } from '../components/RoomBudget';
import { MCPConsole } from '../components/MCPConsole';
import { ProjectWizard } from '../components/ProjectWizard';
import { SupplierSearch } from '../components/SupplierSearch';
import { ActionBar } from '../components/ActionBar';
import { useProject } from '../hooks/useProject';
import { useCatalog } from '../hooks/useCatalog';
import { useLocation } from '../hooks/useLocation';
import { useAppStore } from '../store/appStore';
import type { CreateProjectInput, Project } from '../domain/project';

export function DashboardPage() {
  const { catalog, loading: catalogLoading, error: catalogError } = useCatalog();
  const { project, loading: projectLoading, create, toggleTask } = useProject();
  const { location } = useLocation();
  const { region, setRegion, draftProject } = useAppStore();
  const [wizardOpen, setWizardOpen] = useState(false);

  const currentProject = (draftProject ?? project)!;

  useEffect(() => {
    if (project) {
      setRegion(project.region);
    } else if (location?.region) {
      setRegion(location.region);
    }
  }, [project, location, setRegion]);

  if (catalogLoading || projectLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-on-surface"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <p>Carregando painel de planejamento...</p>
      </div>
    );
  }

  if (catalogError) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ color: '#ba1a1a', fontFamily: 'Manrope, sans-serif' }}
      >
        <p>Erro: {catalogError}</p>
      </div>
    );
  }

  if (!project || !catalog) return null;

  const currentPhase = project.phases.findIndex((p) => p.status === 'in_progress');

  async function handleCreate(input: CreateProjectInput) {
    const result = await create(input);
    if (result) {
      setWizardOpen(false);
    }
    return result as Project | undefined;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <TopBar project={project} onNewProject={() => setWizardOpen(true)} onExport={() => {}} />

      <main className="flex-1 w-full max-w-content-max-width mx-auto px-gutter-desktop py-space-xl space-y-space-2xl">
        <HeroOverview project={currentProject} regions={catalog.regions} />

        <MaterialCatalog catalog={catalog} project={currentProject} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <CBSCalculator project={currentProject} />
          <IGOCalculator project={currentProject} />
        </div>

        <Timeline
          project={currentProject}
          currentPhase={currentPhase >= 0 ? currentPhase : 1}
          onToggleTask={toggleTask}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl items-start">
          <RoomSchedule project={currentProject} />
          <LotViewer project={currentProject} />
        </div>

        <RoomBudget />

        <MCPConsole />

        <SupplierSearch project={currentProject} materials={catalog.materials} />
      </main>

      <ActionBar project={currentProject} materials={catalog.materials} />

      <ProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={handleCreate}
        defaultRegion={region}
        defaultCity={location?.city}
        defaultStateCode={location?.state_code}
        defaultLat={location?.latitude}
        defaultLon={location?.longitude}
      />
    </div>
  );
}
