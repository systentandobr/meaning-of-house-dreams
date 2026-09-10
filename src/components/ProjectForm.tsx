import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { CreateProjectInput, Project } from '../domain/project';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => Promise<Project | undefined>;
  defaultRegion?: string;
  defaultCity?: string;
  defaultStateCode?: string;
  defaultLat?: number;
  defaultLon?: number;
}

export function ProjectForm({
  open,
  onClose,
  onCreate,
  defaultRegion = 'Sudeste',
  defaultCity,
  defaultStateCode,
  defaultLat,
  defaultLon,
}: ProjectFormProps) {
  const [name, setName] = useState('Residência Jardim Botânico');
  const [region, setRegion] = useState(defaultRegion);
  const [city, setCity] = useState(defaultCity || 'São Paulo');
  const [state, setState] = useState(defaultStateCode || 'SP');
  const [area, setArea] = useState(185);
  const [budget, setBudget] = useState(500000);
  const [stories, setStories] = useState(1);
  const [rooms, setRooms] = useState(3);
  const [hasGarden, setHasGarden] = useState(true);
  const [dreams, setDreams] = useState<string[]>(['sustentabilidade', 'ventilacao']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRegion(defaultRegion);
      if (defaultCity) setCity(defaultCity);
      if (defaultStateCode) setState(defaultStateCode);
    }
  }, [open, defaultRegion, defaultCity, defaultStateCode]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateProjectInput = {
        name,
        region,
        city,
        state_code: state,
        latitude: defaultLat,
        longitude: defaultLon,
        area_m2: Number(area),
        budget: Number(budget),
        stories: Number(stories),
        rooms: Number(rooms),
        has_garden: hasGarden,
      };
      await onCreate(input);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const dreamOptions = [
    { id: 'sustentabilidade', label: 'Casa sustentável e de baixo carbono' },
    { id: 'ventilacao', label: 'Ventilação natural e conforto térmico' },
    { id: 'agua', label: 'Autossuficiência hídrica (cisterna/reúso)' },
    { id: 'energia', label: 'Energia solar e independência da rede' },
    { id: 'jardim', label: 'Jardim e áreas verdes integradas' },
    { id: 'expansao', label: 'Expansão futura (quintal/sobrado)' },
    { id: 'madeira', label: 'Madeira certificada e materiais naturais' },
  ];

  function toggleDream(id: string) {
    setDreams((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface rounded-2xl border border-outline-variant shadow-2xl p-space-xl space-y-space-md">
        <div className="flex items-center justify-between border-b border-outline-variant/80 pb-space-sm">
          <div>
            <h2 className="text-headline-md font-headline-md font-semibold text-on-surface">
              Criar Projeto dos Sonhos
            </h2>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Defina a localização, dimensões e os sonhos que guiam a casa.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-space-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <Field label="Nome do projeto">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </Field>
            <Field label="Região bioclimática">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer"
              >
                <option value="Sudeste">Sudeste</option>
                <option value="Centro-Oeste">Centro-Oeste</option>
                <option value="Sul">Sul</option>
                <option value="Nordeste">Nordeste</option>
                <option value="Norte">Norte</option>
              </select>
            </Field>
            <Field label="Cidade">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="UF">
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="Área construída (m²)">
              <input
                type="number"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                min={20}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
                required
              />
            </Field>
            <Field label="Orçamento estimado (R$)">
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="Pavimentos">
              <input
                type="number"
                value={stories}
                onChange={(e) => setStories(Number(e.target.value))}
                min={1}
                max={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </Field>
            <Field label="Quartos">
              <input
                type="number"
                value={rooms}
                onChange={(e) => setRooms(Number(e.target.value))}
                min={1}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
              />
            </Field>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/60 space-y-2">
            <label className="inline-flex items-center gap-2 text-body-md font-body-md text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={hasGarden}
                onChange={(e) => setHasGarden(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              Incluir paisagismo / jardim com espécies nativas
            </label>
          </div>

          <div>
            <span className="block text-label-sm font-label-sm text-on-surface-variant mb-1.5">
              Quais são os seus sonhos para esta casa?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {dreamOptions.map((d) => (
                <label
                  key={d.id}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    dreams.includes(d.id)
                      ? 'bg-primary-fixed border-primary'
                      : 'bg-surface-container-low border-outline-variant'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={dreams.includes(d.id)}
                    onChange={() => toggleDream(d.id)}
                    className="w-4 h-4 accent-primary mt-0.5"
                  />
                  <span className="text-body-sm font-body-sm text-on-surface">{d.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-body-sm font-body-sm text-error">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-variant transition-colors text-label-md font-label-md font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all shadow-sm text-label-md font-label-md font-bold disabled:opacity-60"
            >
              <Icon name="rocket_launch" className="text-[18px]" />
              {submitting ? 'Criando...' : 'Gerar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-label-sm font-label-sm text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}
