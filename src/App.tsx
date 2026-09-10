import { useEffect, useMemo, useState } from 'react';
import { TopBar } from './components/TopBar';
import { HeroOverview } from './components/HeroOverview';
import { MaterialCatalog } from './components/MaterialCatalog';
import { CBSCalculator } from './components/CBSCalculator';
import { IGOCalculator } from './components/IGOCalculator';
import { Timeline } from './components/Timeline';
import { RoomSchedule } from './components/RoomSchedule';
import LotViewer from './components/LotViewer';
import { RoomBudget } from './components/RoomBudget';
import { MCPConsole } from './components/MCPConsole';
import { ProjectWizard } from './components/ProjectWizard';
import { SupplierSearch } from './components/SupplierSearch';
import { ActionBar } from './components/ActionBar';
import { useProject } from './hooks/useProject';
import { useCatalog } from './hooks/useCatalog';
import { useLocation } from './hooks/useLocation';

function App() {
  const { catalog, loading: catalogLoading, error: catalogError } = useCatalog();
  const { project, loading: projectLoading, create, toggleTask } = useProject();
  const { location } = useLocation();
  const [region, setRegion] = useState(location?.region || 'Sudeste');
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    if (project) {
      setRegion(project.region);
    } else if (location?.region) {
      setRegion(location.region);
    }
  }, [project, location]);

  const showOnboarding = useMemo(
    () => !project && !projectLoading && !catalogLoading,
    [project, projectLoading, catalogLoading],
  );

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

  if (showOnboarding) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-on-surface px-6"
        style={{ fontFamily: 'Manrope, sans-serif', background: '#fff8f1' }}
      >
        <h1 className="text-headline-lg font-headline-lg font-semibold mb-4 text-center">
          Bem-vindo ao Casa dos Sonhos
        </h1>
        <p className="text-body-md font-body-md text-on-surface-variant mb-8 max-w-lg text-center">
          Antes de visualizar o painel, crie seu primeiro projeto de casa sustentável. Conte o sonho,
          desenhe o terreno e deixe o sistema sugerir as áreas.
        </p>
        <button
          onClick={() => setWizardOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all shadow-sm text-label-lg font-label-lg font-bold"
        >
          Criar Projeto dos Sonhos
        </button>
        <ProjectWizard
          open={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onCreate={create}
          defaultRegion={region}
          defaultCity={location?.city}
          defaultStateCode={location?.state_code}
          defaultLat={location?.latitude}
          defaultLon={location?.longitude}
        />
      </div>
    );
  }

  if (!project || !catalog) return null;

  const currentPhase = project.phases.findIndex((p) => p.status === 'in_progress');

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <TopBar project={project} onNewProject={() => setWizardOpen(true)} onExport={() => {}} />

      <main className="flex-1 w-full max-w-content-max-width mx-auto px-gutter-desktop py-space-xl space-y-space-2xl">
        <HeroOverview
          project={project}
          region={region}
          onRegionChange={setRegion}
          regions={catalog.regions}
        />

        <MaterialCatalog catalog={catalog} region={region} project={project} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          <CBSCalculator project={project} />
          <IGOCalculator project={project} />
        </div>

        <Timeline
          project={project}
          currentPhase={currentPhase >= 0 ? currentPhase : 1}
          onToggleTask={toggleTask}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
          <RoomSchedule project={project} />
          <LotViewer project={project} />
        </div>

        <RoomBudget />

        <MCPConsole defaultRegion={region} />

        <SupplierSearch project={project} materials={catalog.materials} />
      </main>

      <ActionBar project={project} materials={catalog.materials} />

      <ProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreate={create}
        defaultRegion={region}
        defaultCity={location?.city}
        defaultStateCode={location?.state_code}
        defaultLat={location?.latitude}
        defaultLon={location?.longitude}
      />
    </div>
  );
}

export default App;
