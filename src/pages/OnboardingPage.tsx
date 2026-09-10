import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ProjectWizard } from '../components/ProjectWizard';
import { Icon } from '../components/Icon';
import { useCatalog } from '../hooks/useCatalog';
import { useLocation } from '../hooks/useLocation';
import { useProject } from '../hooks/useProject';
import type { CreateProjectInput, Project } from '../domain/project';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 24, opacity: 0, filter: 'blur(10px)' },
  visible: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const orbVariants = {
  initial: { scale: 1, opacity: 0.6 },
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.6, 0.8, 0.6],
    x: [0, 20, -10, 0],
    y: [0, -15, 10, 0],
    transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

export function OnboardingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const navigate = useNavigate();
  const { catalog, loading: catalogLoading } = useCatalog();
  const { location } = useLocation();
  const { create } = useProject();

  const region = location?.region || 'Sudeste';

  async function handleCreate(input: CreateProjectInput) {
    const result = (await create(input)) as Project | undefined;
    if (result) {
      setWizardOpen(false);
      navigate('/', { replace: true });
    }
    return result;
  }

  if (catalogLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-on-surface"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <p>Carregando catálogo de materiais...</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ fontFamily: 'Manrope, sans-serif', background: '#fff8f1' }}
    >
      {/* Floating decorative orbs inspired by /site */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        variants={orbVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
        variants={orbVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '2s' }}
      />

      <motion.div
        className="relative z-10 max-w-2xl text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-label-sm font-semibold mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Arquitetura Biofílica
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-on-surface mb-6 leading-tight"
        >
          Bem-vindo ao{' '}
          <span className="text-primary">Casa dos Sonhos</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-on-surface-variant mb-8 leading-relaxed"
        >
          Antes de visualizar o painel, crie seu primeiro projeto de casa sustentável.
          Conte o sonho, desenhe o terreno e deixe o sistema sugerir as áreas.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-on-primary font-bold text-label-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Icon name="rocket_launch" className="text-[20px]" />
            Criar Projeto dos Sonhos
          </motion.button>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-8 text-body-sm text-on-surface-variant"
        >
          {catalog?.materials.length || 0} materiais de baixo impacto no catálogo
        </motion.p>
      </motion.div>

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
