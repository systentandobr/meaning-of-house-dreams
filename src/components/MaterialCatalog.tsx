import { useState } from 'react';
import { Icon } from './Icon';
import { useAppStore } from '../store/appStore';
import type { Catalog, Material } from '../domain/material';
import type { Project } from '../domain/project';

interface MaterialCatalogProps {
  catalog: Catalog;
  project: Project | null;
}

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'structure', label: 'Estrutura & Paredes' },
  { id: 'finish', label: 'Acabamentos & Pisos' },
  { id: 'insulation', label: 'Isolamento & Cobertura' },
  { id: 'frames', label: 'Esquadrias' },
];

function matchesCategory(m: Material, cat: string): boolean {
  if (cat === 'all') return true;
  const c = m.category.toLowerCase();
  if (cat === 'structure') return c.includes('estrutura') || c.includes('parede') || c.includes('alvenaria');
  if (cat === 'finish') return c.includes('acabamento') || c.includes('piso') || c.includes('revestimento') || c.includes('tinta') || c.includes('argamassa');
  if (cat === 'insulation') return c.includes('cobertura') || c.includes('isolamento') || c.includes('telhado');
  if (cat === 'frames') return c.includes('esquadria') || c.includes('abertura') || c.includes('vidro') || c.includes('madeira');
  return false;
}

function formatUnit(label: string | undefined, fallback: string): string {
  return label || fallback;
}

function formatPrice(price?: number): string {
  if (price === undefined) return '—';
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

export function MaterialCatalog({ catalog, project }: MaterialCatalogProps) {
  const [activeCat, setActiveCat] = useState('all');
  const { region, selectedMaterialIds, toggleMaterial } = useAppStore();
  const selectedIds = new Set(project?.selected_material_ids ?? selectedMaterialIds);

  const materials = catalog.materials.filter((m) => matchesCategory(m, activeCat));

  return (
    <section className="space-y-space-lg" id="catalogo">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-headline-md font-semibold text-on-surface">
            Catálogo de Materiais de Baixo Impacto
          </h2>
          <p className="text-body-md font-body-md text-on-surface-variant">
            Composição autêntica de materiais nativos, certificados e de alta inércia térmica para o clima brasileiro.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container-low rounded-xl border border-outline-variant">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`px-3.5 py-1.5 rounded-lg text-label-md font-label-md font-semibold transition-colors ${
                activeCat === c.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        {materials.map((m) => {
          const price = m.prices_per_region[region];
          const selected = selectedIds.has(m.id);
          const score = m.bio_score ?? Math.round(m.sustainability_factor * 100);
          return (
            <div
              key={m.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden tactile-card flex flex-col justify-between"
            >
              {m.image_url ? (
                <div className="relative h-48 w-full overflow-hidden bg-surface-container">
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant/60 flex items-center gap-1 text-label-sm font-label-sm font-bold text-primary">
                    <Icon name="eco" className="text-[14px]" fill />
                    Score Bio: {score}/100
                  </div>
                  {m.display_category && (
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-on-background/70 text-surface-container-lowest text-label-sm font-label-sm font-medium">
                      {m.display_category}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-24 w-full bg-surface-container border-b border-outline-variant/40" />
              )}

              <div className="p-space-md space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-title-lg font-title-lg font-semibold text-on-surface">{m.name}</h3>
                  <span className="text-title-md font-title-md font-bold text-secondary whitespace-nowrap">
                    {formatPrice(price)}
                    <span className="text-body-sm font-normal text-on-surface-variant"> / {formatUnit(m.unit_label, m.unit)}</span>
                  </span>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant">{m.description}</p>

                {(m.badges && m.badges.length > 0) ? (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    {m.badges.map((badge, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-label-sm font-label-sm font-medium ${
                          i === 0
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : 'bg-secondary-fixed text-on-secondary-fixed'
                        }`}
                      >
                        <Icon name={badge.icon} className="text-[14px]" />
                        {badge.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-medium">
                      <Icon name="check_circle" className="text-[14px]" />
                      CO₂: {m.co2_kg_per_unit} kg/un
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-label-sm font-label-sm font-medium">
                      Vida útil: {m.lifespan_years} anos
                    </span>
                  </div>
                )}
              </div>

              <div className="p-space-md pt-0 border-t border-outline-variant/40 mt-3 flex items-center justify-between">
                <span className="text-label-sm font-label-sm text-on-surface-variant">
                  {m.origin || m.yield || m.u_value || m.acoustic || m.consumption || m.source_note || 'Referência SINAPI (protótipo)'}
                </span>
                <button
                  onClick={() => toggleMaterial(m.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-label-md font-label-md font-semibold border ${
                    selected
                      ? 'bg-primary text-on-primary border-transparent shadow-sm'
                      : 'bg-surface-container text-on-surface border-outline-variant'
                  }`}
                >
                  <Icon name={selected ? 'check' : 'add'} className="text-[16px]" />
                  {selected ? 'No Plano' : '+ Adicionar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-label-sm font-label-sm text-on-surface-variant">
        Preços de referência prototípicos ({catalog.unit_prices_reference_date}). Validar com SINAPI/Caixa atualizado.
      </p>
    </section>
  );
}
