import { useState } from 'react';
import { Icon } from './Icon';
import { useProject } from '../hooks/useProject';
import { useAppStore } from '../store/appStore';
import type { Project } from '../domain/project';

interface LotSettingsDrawerProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function LotSettingsDrawer({ project, open, onClose }: LotSettingsDrawerProps) {
  const { simulate, update } = useProject();
  const {
    setDraftProject,
    isSimulation,
    startSimulation,
    magneticSnapEnabled,
    setMagneticSnapEnabled,
    wallThickness,
    setWallThickness,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(project.lot_width);
  const [depth, setDepth] = useState(project.lot_depth);
  const [shape, setShape] = useState(project.lot_shape || 'regular');
  const [front, setFront] = useState(project.front_setback || 3);
  const [side, setSide] = useState(project.side_setback || 1.5);
  const [back, setBack] = useState(project.back_setback || 1.5);

  const totalArea = Math.round(width * depth * (shape === 'triangular' ? 0.5 : 1));

  async function handleSimulate() {
    setLoading(true);
    try {
      const p = await simulate(project.id, {
        lot_width: width,
        lot_depth: depth,
        lot_shape: shape,
        front_setback: front,
        side_setback: side,
        back_setback: back,
      });
      setDraftProject(p);
      if (!isSimulation) startSimulation(p);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setLoading(true);
    try {
      await update(project.id, {
        lot_width: width,
        lot_depth: depth,
        lot_shape: shape,
        front_setback: front,
        side_setback: side,
        back_setback: back,
      });
      onClose();
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-on-background/30" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-surface-container-low border-l border-outline-variant shadow-xl p-space-xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
              <Icon name="tune" className="text-[16px]" />
              Configurações do Lote
            </div>
            <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
              Terreno e Recuos
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container">
            <Icon name="close" className="text-[20px] text-on-surface-variant" />
          </button>
        </div>

        <div className="space-y-4">
          <NumberField label="Largura (m)" value={width} onChange={setWidth} min={6} max={100} />
          <NumberField label="Profundidade (m)" value={depth} onChange={setDepth} min={10} max={200} />

          <div>
            <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">Forma</label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md"
            >
              <option value="regular">Regular</option>
              <option value="triangular">Triangular</option>
              <option value="irregular">Irregular</option>
            </select>
          </div>

          <NumberField label="Recuo frontal (m)" value={front} onChange={setFront} min={0} max={20} />
          <NumberField label="Recuo lateral (m)" value={side} onChange={setSide} min={0} max={20} />
          <NumberField label="Recuo fundos (m)" value={back} onChange={setBack} min={0} max={20} />

          <div className="pt-2 border-t border-outline-variant/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-label-sm font-semibold text-on-surface block">
                  Encaixe Magnético (Lego Wall Snap)
                </label>
                <span className="text-[11px] text-on-surface-variant block">
                  Une paredes de cômodos e alinha ao envelope construtivo
                </span>
              </div>
              <input
                type="checkbox"
                checked={magneticSnapEnabled}
                onChange={(e) => setMagneticSnapEnabled(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">
                Espessura Padrão das Paredes (Engenharia NBR)
              </label>
              <select
                value={wallThickness}
                onChange={(e) => setWallThickness(Number(e.target.value))}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md"
              >
                <option value={0.15}>0,15m (15cm - Alvenaria Convencional / NBR)</option>
                <option value={0.20}>0,20m (20cm - Tijolo Ecológico / Estrutural)</option>
                <option value={0.10}>0,10m (10cm - Drywall / Divisória Leve)</option>
                <option value={0.25}>0,25m (25cm - Parede Dupla / Alta Inércia Térmica)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container border border-outline-variant">
            <span className="text-label-sm text-on-surface-variant block">Área do lote</span>
            <span className="text-title-md font-title-md font-bold text-primary">{totalArea} m²</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-label-md disabled:opacity-60"
          >
            {loading ? 'Simulando...' : 'Simular alterações'}
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </aside>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <label className="block text-label-sm font-label-sm text-on-surface-variant mb-1">{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface"
      />
    </div>
  );
}
