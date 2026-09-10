import { useState } from 'react';
import { Icon } from './Icon';
import { calculationService } from '../services/calculationService';
import type { Project } from '../domain/project';

interface IGOCalculatorProps {
  project: Project;
  onRecalculated?: (score: number) => void;
}

export function IGOCalculator({ project, onRecalculated }: IGOCalculatorProps) {
  const [area, setArea] = useState(project.area_m2 || 185);
  const [auto, setAuto] = useState(75);
  const [local, setLocal] = useState(85);
  const [contingency, setContingency] = useState(8);
  const [score, setScore] = useState(project.igo);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recompute() {
    setComputing(true);
    setError(null);
    try {
      const locationDim = Math.min(100, local + 10);
      const costDim = Math.max(20, 100 - contingency * 2);
      const timeDim = Math.min(100, 60 + (auto - 30));
      const sustainabilityDim = auto;
      const qualityDim = Math.min(100, 60 + local / 3);
      const res = await calculationService.calculateIGO({
        location: locationDim,
        cost: costDim,
        time: timeDim,
        sustainability: sustainabilityDim,
        quality: qualityDim,
      });
      const s = typeof res.score === 'number' ? res.score : project.igo;
      setScore(s);
      onRecalculated?.(s);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setComputing(false);
    }
  }

  const selo =
    score >= 85
      ? { label: 'Selo Ouro', color: 'text-secondary', bg: 'bg-secondary-fixed text-on-secondary-fixed' }
      : score >= 70
        ? { label: 'Selo Prata', color: 'text-primary', bg: 'bg-primary-fixed text-on-primary-fixed' }
        : score >= 50
          ? { label: 'Selo Bronze', color: 'text-on-surface-variant', bg: 'bg-surface-container text-on-surface' }
          : { label: 'Requer Revisão', color: 'text-error', bg: 'bg-error-container text-on-error-container' };

  return (
    <section
      className="lg:col-span-5 bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-lg shadow-sm"
      id="indice-igo"
    >
      <div className="border-b border-outline-variant/80 pb-space-sm">
        <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
          <Icon name="tune" className="text-[16px]" />
          Viabilidade e Governança
        </div>
        <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">Índice IGO de Obra</h2>
      </div>

      <div className="flex items-center gap-space-lg bg-surface-container-lowest rounded-xl p-space-md border border-outline-variant">
        <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-surface-container"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-primary transition-all duration-500"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-headline-md font-headline-md font-extrabold text-on-surface">{Math.round(score)}</span>
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Score</span>
          </div>
        </div>
        <div>
          <span className={`px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-bold ${selo.bg}`}>
            {selo.label}
          </span>
          <h4 className="text-title-md font-title-md font-semibold text-on-surface mt-1">Viabilidade do Projeto</h4>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Índice de Gestão Orçamentária da Obra (protótipo educacional).
          </p>
        </div>
      </div>

      <div className="space-y-space-md">
        <Slider
          label="Área Construída Total"
          value={area}
          min={80}
          max={450}
          suffix=" m²"
          marks={['80 m² (Chalé)', '250 m²', '450 m² (Quinta)']}
          onChange={setArea}
        />
        <Slider
          label="Autossuficiência (Energia + Água)"
          value={auto}
          min={30}
          max={100}
          suffix="%"
          marks={['30% (Híbrido)', '75% (Zero Carbon)', '100% (Off-Grid)']}
          onChange={setAuto}
        />
        <Slider
          label="Mão de Obra e Ofícios Locais"
          value={local}
          min={0}
          max={100}
          suffix="%"
          marks={['Regional restrito', 'Comunidade ativa (>80%)']}
          onChange={setLocal}
        />

        <div className="pt-2 flex items-center justify-between bg-surface-container p-3 rounded-lg border border-outline-variant">
          <div>
            <span className="text-label-md font-label-md font-semibold text-on-surface block">
              Margem de Contingência Verde
            </span>
            <span className="text-body-sm font-body-sm text-on-surface-variant">
              Reserva para flutuações e clima
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContingency((c) => Math.max(0, c - 1))}
              className="w-7 h-7 rounded bg-surface-container-lowest border border-outline-variant flex items-center justify-center font-bold text-on-surface hover:bg-surface-variant transition-colors"
            >
              -
            </button>
            <span className="text-label-md font-label-md font-bold text-on-surface w-8 text-center">
              {contingency}%
            </span>
            <button
              onClick={() => setContingency((c) => Math.min(25, c + 1))}
              className="w-7 h-7 rounded bg-surface-container-lowest border border-outline-variant flex items-center justify-center font-bold text-on-surface hover:bg-surface-variant transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <button
          onClick={recompute}
          disabled={computing}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all shadow-sm text-label-md font-label-md font-bold disabled:opacity-60"
        >
          <Icon name="autorenew" className="text-[18px]" />
          {computing ? 'Calculando...' : 'Recalcular IGO'}
        </button>
        {error && <p className="text-body-sm font-body-sm text-error">{error}</p>}
      </div>
    </section>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  marks: string[];
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, suffix, marks, onChange }: SliderProps) {
  return (
    <div>
      <div className="flex justify-between text-label-md font-label-md text-on-surface mb-1.5">
        <span>{label}</span>
        <span className="font-bold text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-outline-variant h-2 rounded-lg cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-on-surface-variant mt-1 font-medium">
        {marks.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
    </div>
  );
}
