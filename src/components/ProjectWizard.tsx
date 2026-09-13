import { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import type { CreateProjectInput, Project, Discovery, ConstructionProfile } from '../domain/project';

interface ProjectWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateProjectInput) => Promise<Project | undefined>;
  defaultRegion?: string;
  defaultCity?: string;
  defaultStateCode?: string;
  defaultLat?: number;
  defaultLon?: number;
}

interface Message {
  from: 'user' | 'system';
  text: string;
  chips?: string[];
}

const LOT_SHAPES = [
  { id: 'regular', label: 'Retangular' },
  { id: 'triangular', label: 'Triangular' },
  { id: 'irregular', label: 'Irregular / Outro' },
];

const GARDEN_OPTIONS = [
  { id: 'native', label: 'Jardim nativo' },
  { id: 'vegetable', label: 'Horta' },
  { id: 'deck', label: 'Deck' },
  { id: 'barbecue', label: 'Churrasqueira' },
  { id: 'pool', label: 'Piscina' },
];

const SUST_OPTIONS = [
  { id: 'solar', label: 'Energia solar' },
  { id: 'cistern', label: 'Cisterna' },
  { id: 'reuse', label: 'Reúso de água' },
  { id: 'compost', label: 'Compostagem' },
  { id: 'green_roof', label: 'Telhado verde' },
];

const STYLE_OPTIONS = ['modernista', 'rústico', 'minimalista', 'biophilic', 'colonial'];

function toggleList(list: string[], item: string) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export function ProjectWizard({
  open,
  onClose,
  onCreate,
  defaultRegion = 'Sudeste',
  defaultCity,
  defaultStateCode,
}: ProjectWizardProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Residência Jardim Botânico');
  const [dreamText, setDreamText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { from: 'system', text: 'Conte-me o sonho da sua casa. Pode ser solto: luz, vento, jardim, madeira, cisterna...' },
  ]);
  const [lotWidth, setLotWidth] = useState('12');
  const [lotDepth, setLotDepth] = useState('25');
  const [lotShape, setLotShape] = useState('regular');
  const [stories, setStories] = useState('1');
  const [budget, setBudget] = useState('500000');
  const [profile, setProfile] = useState<ConstructionProfile>({ construction_method: 'alvenaria_convencional', finish_standard: 'medio', material_preferences: { sustainability_weight: 0.5, budget_weight: 0.5, regional_availability: true, deadline_weight: 0.3, aesthetic_style: 'biophilic' } });

  const [discovery, setDiscovery] = useState<Discovery>({
    adults: 2,
    children: 0,
    elderly: 0,
    pets: [],
    usage: 'permanent',
    floors: 1,
    bedrooms: 2,
    suites: 0,
    bathrooms: 1,
    half_baths: 0,
    closets: 0,
    kitchen: true,
    pantry: false,
    living: true,
    dining: true,
    office: false,
    laundry: true,
    garage_spots: 1,
    storage: false,
    corridors: true,
    garden: [],
    sustainability: ['solar', 'cistern'],
    style: 'biophilic',
    wind: 'frente',
    sun: 'manha',
    slope: 'plano',
    accessibility: false,
    budget: 500000,
    deadline_months: 12,
    priorities: ['sustentabilidade', 'conforto termico'],
    dream_text: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step]);

  const lotArea = useMemo(() => {
    const w = Number(lotWidth) || 0;
    const d = Number(lotDepth) || 0;
    const base = w * d;
    if (lotShape === 'triangular') return base * 0.5;
    if (lotShape === 'irregular') return base * 0.85;
    return base;
  }, [lotWidth, lotDepth, lotShape]);

  const suggestions = useMemo(() => {
    const built = lotArea * 0.45 * 0.88;
    const garden = lotArea * 0.25;
    const outdoor = lotArea * 0.30;
    const floor = built * Number(stories || 1);
    return { built: Math.round(built), garden: Math.round(garden), outdoor: Math.round(outdoor), floor: Math.round(floor) };
  }, [lotArea, stories]);

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { from: 'user', text }]);
  }
  function pushSystem(text: string, chips?: string[]) {
    setMessages((prev) => [...prev, { from: 'system', text, chips }]);
  }

  function handleDreamSubmit() {
    const text = dreamText.trim();
    if (!text) return;
    pushUser(text);
    setDiscovery((d) => ({ ...d, dream_text: text }));
    setDreamText('');
    setTimeout(() => {
      pushSystem('Agora vamos desenhar o terreno e conhecer a família.');
      setStep(1);
    }, 400);
  }

  function handleLotNext() {
    pushSystem(`Terreno de ${Math.round(lotArea)}m² anotado. Vamos detalhar os cômodos.`);
    setStep(2);
  }

  function handleDiscoveryNext() {
    const summary = [
      `${discovery.bedrooms} quarto(s), ${discovery.suites} suíte(s)`,
      `${discovery.bathrooms} banheiro(s) + ${discovery.half_baths} lavabo(s)`,
      discovery.kitchen ? 'Cozinha' : '',
      discovery.living ? 'Sala de estar' : '',
      discovery.dining ? 'Sala de jantar' : '',
      discovery.office ? 'Home office' : '',
      discovery.laundry ? 'Lavanderia' : '',
      discovery.garden.length > 0 ? `Jardim: ${discovery.garden.join(', ')}` : '',
    ].filter(Boolean);
    pushSystem('Perfeito. Seu programa de necessidades:', summary);
    setStep(3);
  }

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const input: CreateProjectInput = {
        name,
        region: defaultRegion,
        city: defaultCity || 'São Paulo',
        state_code: defaultStateCode || 'SP',
        lot_width: Number(lotWidth) || 0,
        lot_depth: Number(lotDepth) || 0,
        lot_shape: lotShape,
        floor_area_m2: suggestions.floor,
        dreams: discovery.dream_text,
        discovery,
        area_m2: suggestions.floor,
        budget: Number(budget) || 0,
        stories: Number(stories) || 1,
        rooms: discovery.bedrooms,
        has_garden: discovery.garden.length > 0,
        profile,
      };
      await onCreate(input);
      onClose();
      setStep(0);
      setMessages([{ from: 'system', text: 'Conte-me o sonho da sua casa. Pode ser solto: luz, vento, jardim, madeira, cisterna...' }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-surface rounded-2xl border border-outline-variant shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between p-space-md border-b border-outline-variant/80 bg-surface-container-low gap-4">
          <div className="flex-1 min-w-0">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-headline-md font-headline-md font-semibold text-on-surface border-b border-dashed border-outline-variant/50 focus:border-primary focus:outline-none pb-1 truncate"
              placeholder="Nome do projeto"
              aria-label="Nome do projeto"
            />
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">Uma conversa para desenhar a casa ideal no terreno certo.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant flex-shrink-0">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-space-md space-y-space-md bg-surface-bright">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-space-md ${
                msg.from === 'user'
                  ? 'bg-primary text-on-primary rounded-tr-sm text-body-md font-body-md'
                  : 'bg-surface-container-low text-on-surface rounded-tl-sm border border-outline-variant text-body-sm font-body-sm'
              }`}>
                {msg.text}
                {msg.chips && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.chips.map((chip, j) => (
                      <span key={j} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-medium">
                        <Icon name="check_circle" className="text-[14px]" />
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={endRef} />

          {step === 0 && (
            <StepDream dreamText={dreamText} setDreamText={setDreamText} onSubmit={handleDreamSubmit} />
          )}
          {step === 1 && (
            <StepLot
              lotWidth={lotWidth} setLotWidth={setLotWidth}
              lotDepth={lotDepth} setLotDepth={setLotDepth}
              lotShape={lotShape} setLotShape={setLotShape}
              stories={stories} setStories={setStories}
              budget={budget} setBudget={setBudget}
              lotArea={lotArea}
              onNext={handleLotNext}
            />
          )}
          {step === 2 && (
            <StepDiscovery discovery={discovery} setDiscovery={setDiscovery} onNext={handleDiscoveryNext} />
          )}
          {step === 3 && (
            <StepConfirm
              suggestions={suggestions}
              discovery={discovery}
              profile={profile}
              setProfile={setProfile}
              onCreate={handleCreate}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function StepDream({ dreamText, setDreamText, onSubmit }: any) {
  return (
    <div className="space-y-3">
      <label className="block">
        <span className="block text-body-sm text-on-surface-variant mb-1">Conte seu sonho em texto livre</span>
        <textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="Quero uma casa com luz da manhã, vento passando, jardim com espécies nativas e uma varanda..."
          rows={4}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2 text-body-md resize-none"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {['Sustentabilidade', 'Ventilação natural', 'Energia solar', 'Cisterna', 'Jardim nativo', 'Madeira FSC'].map((tag) => (
          <button
            key={tag}
            onClick={() => setDreamText((t: string) => (t ? `${t}, ${tag.toLowerCase()}` : tag.toLowerCase()))}
            className="px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant text-label-sm text-on-surface hover:border-primary"
          >
            {tag}
          </button>
        ))}
      </div>
      <button onClick={onSubmit} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-sm font-bold">
        <Icon name="chat" className="text-[18px]" /> Continuar
      </button>
    </div>
  );
}

function StepLot({ lotWidth, setLotWidth, lotDepth, setLotDepth, lotShape, setLotShape, stories, setStories, budget, setBudget, lotArea, onNext }: any) {
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant p-space-md space-y-4">
      <p className="text-body-md text-on-surface">Vamos desenhar o terreno.</p>
      <div className="grid grid-cols-2 gap-space-md">
        <Field label="Largura (m)"><input type="number" value={lotWidth} onChange={(e) => setLotWidth(e.target.value)} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Comprimento (m)"><input type="number" value={lotDepth} onChange={(e) => setLotDepth(e.target.value)} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Formato">
          <select value={lotShape} onChange={(e) => setLotShape(e.target.value)} className="w-full rounded-lg px-3 py-2 border appearance-none">
            {LOT_SHAPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Pavimentos"><input type="number" value={stories} onChange={(e) => setStories(e.target.value)} min={1} max={4} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Orçamento (R$)"><input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-lg px-3 py-2 border" /></Field>
      </div>
      <div className="p-3 rounded-lg bg-tertiary-fixed/40 border border-primary-fixed text-body-sm">
        <strong>Área do lote:</strong> {Math.round(lotArea)}m²
      </div>
      <button onClick={onNext} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-sm font-bold">
        <Icon name="straighten" className="text-[18px]" /> Detalhar cômodos
      </button>
    </div>
  );
}

function StepDiscovery({ discovery, setDiscovery, onNext }: any) {
  function upd(key: keyof Discovery, value: any) {
    setDiscovery((d: Discovery) => ({ ...d, [key]: value }));
  }
  function toggle(key: 'garden' | 'sustainability', id: string) {
    setDiscovery((d: Discovery) => ({ ...d, [key]: toggleList(d[key], id) }));
  }
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant p-space-md space-y-4">
      <p className="text-body-md text-on-surface">Quem vai morar e como a casa será usada?</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Adultos"><input type="number" value={discovery.adults} onChange={(e) => upd('adults', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Crianças"><input type="number" value={discovery.children} onChange={(e) => upd('children', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Idosos"><input type="number" value={discovery.elderly} onChange={(e) => upd('elderly', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Quartos"><input type="number" value={discovery.bedrooms} onChange={(e) => upd('bedrooms', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Field label="Suítes"><input type="number" value={discovery.suites} onChange={(e) => upd('suites', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Banheiros"><input type="number" value={discovery.bathrooms} onChange={(e) => upd('bathrooms', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Lavabos"><input type="number" value={discovery.half_baths} onChange={(e) => upd('half_baths', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
        <Field label="Closets"><input type="number" value={discovery.closets} onChange={(e) => upd('closets', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" /></Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <ToggleChip label="Cozinha" value={discovery.kitchen} onChange={(v: boolean) => upd('kitchen', v)} />
        <ToggleChip label="Despensa" value={discovery.pantry} onChange={(v: boolean) => upd('pantry', v)} />
        <ToggleChip label="Sala de estar" value={discovery.living} onChange={(v: boolean) => upd('living', v)} />
        <ToggleChip label="Sala de jantar" value={discovery.dining} onChange={(v: boolean) => upd('dining', v)} />
        <ToggleChip label="Home office" value={discovery.office} onChange={(v: boolean) => upd('office', v)} />
        <ToggleChip label="Lavanderia" value={discovery.laundry} onChange={(v: boolean) => upd('laundry', v)} />
        <ToggleChip label="Depósito" value={discovery.storage} onChange={(v: boolean) => upd('storage', v)} />
        <ToggleChip label="Corredores" value={discovery.corridors} onChange={(v: boolean) => upd('corridors', v)} />
        <ToggleChip label="Acessibilidade" value={discovery.accessibility} onChange={(v: boolean) => upd('accessibility', v)} />
      </div>

      <Field label="Vagas de garagem">
        <input type="number" value={discovery.garage_spots} onChange={(e) => upd('garage_spots', Number(e.target.value))} className="w-full rounded-lg px-3 py-2 border" />
      </Field>

      <div>
        <span className="block text-label-sm text-on-surface-variant mb-1">Áreas externas</span>
        <div className="flex flex-wrap gap-2">
          {GARDEN_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => toggle('garden', o.id)}
              className={`px-3 py-1.5 rounded-full text-label-sm border ${discovery.garden.includes(o.id) ? 'bg-primary-fixed border-primary' : 'bg-surface-container border-outline-variant'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="block text-label-sm text-on-surface-variant mb-1">Sustentabilidade</span>
        <div className="flex flex-wrap gap-2">
          {SUST_OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => toggle('sustainability', o.id)}
              className={`px-3 py-1.5 rounded-full text-label-sm border ${discovery.sustainability.includes(o.id) ? 'bg-primary-fixed border-primary' : 'bg-surface-container border-outline-variant'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <Field label="Estilo arquitetônico">
        <select value={discovery.style} onChange={(e) => upd('style', e.target.value)} className="w-full rounded-lg px-3 py-2 border appearance-none">
          {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <button onClick={onNext} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-sm font-bold">
        <Icon name="list" className="text-[18px]" /> Ver proposta de cômodos
      </button>
    </div>
  );
}

function StepConfirm({ suggestions, discovery, profile, setProfile, onCreate, submitting, error }: any) {
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant p-space-md space-y-4">
      <p className="text-body-md text-on-surface">Ajuste se quiser, ou confirme para gerar o plano.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SuggestionCard label="Área construída" value={suggestions.built} unit="m²" />
        <SuggestionCard label="Área total pavimentos" value={suggestions.floor} unit="m²" />
        <SuggestionCard label="Jardim / paisagismo" value={suggestions.garden} unit="m²" />
        <SuggestionCard label="Áreas externas" value={suggestions.outdoor} unit="m²" />
      </div>
      <div className="p-3 rounded-lg bg-surface-container border border-outline-variant text-body-sm text-on-surface-variant">
        Programa: {discovery.bedrooms} quarto(s), {discovery.suites} suíte(s), {discovery.bathrooms} banheiro(s), estilo {discovery.style}. Recuos, ventilação cruzada e acessibilidade serão considerados no desenho.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Método construtivo"><select value={profile.construction_method} onChange={(e) => setProfile({ ...profile, construction_method: e.target.value })} className="w-full rounded-lg px-3 py-2 border"><option value="alvenaria_convencional">Alvenaria convencional</option><option value="alvenaria_estrutural">Alvenaria estrutural</option><option value="steel_frame">Steel frame</option><option value="wood_frame">Wood frame</option><option value="concreto_moldado">Concreto moldado</option><option value="modular">Modular</option></select></Field>
        <Field label="Padrão de acabamento"><select value={profile.finish_standard} onChange={(e) => setProfile({ ...profile, finish_standard: e.target.value })} className="w-full rounded-lg px-3 py-2 border"><option value="economico">Econômico</option><option value="medio">Médio</option><option value="alto_padrao">Alto padrão</option></select></Field>
      </div>
      {error && <p className="text-body-sm text-error">{error}</p>}
      <button onClick={onCreate} disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary shadow-sm font-bold disabled:opacity-60">
        <Icon name="rocket_launch" className="text-[18px]" />
        {submitting ? 'Criando...' : 'Gerar meu Plano'}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-label-sm text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}

function ToggleChip({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`p-2.5 rounded-lg border text-left text-body-sm transition-colors ${value ? 'bg-primary-fixed border-primary' : 'bg-surface border-outline-variant'}`}
    >
      <span className="flex items-center gap-2">
        <span className={`w-4 h-4 rounded border flex items-center justify-center ${value ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant'}`}>
          {value && <Icon name="check" className="text-[12px]" />}
        </span>
        {label}
      </span>
    </button>
  );
}

function SuggestionCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="p-3 rounded-xl bg-surface border border-outline-variant flex items-center justify-between">
      <span className="text-body-sm text-on-surface-variant">{label}</span>
      <span className="text-title-md font-bold text-on-surface">{value} <span className="text-body-sm font-normal text-on-surface-variant">{unit}</span></span>
    </div>
  );
}
