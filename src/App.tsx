import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider, useProject } from './hooks/useProject';
import { DashboardPage } from './pages/DashboardPage';
import { OnboardingPage } from './pages/OnboardingPage';

function AppRoutes() {
  const { project, loading } = useProject();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-on-surface"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <p>Carregando painel de planejamento...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={project ? <DashboardPage /> : <Navigate to="/onboarding" replace />}
      />
      <Route
        path="/onboarding"
        element={project ? <Navigate to="/" replace /> : <OnboardingPage />}
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ProjectProvider>
        <AppRoutes />
      </ProjectProvider>
    </BrowserRouter>
  );
}

export default App;
