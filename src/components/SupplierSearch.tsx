import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { useSuppliers } from '../hooks/useSuppliers';
import type { Material } from '../domain/material';
import type { Project } from '../domain/project';

interface SupplierSearchProps {
  project: Project;
  materials: Material[];
}

export function SupplierSearch({ project, materials }: SupplierSearchProps) {
  const { suppliers, loading, error, search } = useSuppliers();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    search({ region: project.region, state: project.state_code, city: project.city });
  }, [project, search]);

  function handleSearch() {
    search({ region: project.region, state: project.state_code, city: project.city, query, category });
  }

  function findMaterialName(id: string) {
    return materials.find((m) => m.id === id)?.name || id;
  }

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm" id="fornecedores">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
            <Icon name="store" className="text-[16px]" />
            Fornecedores Regionais
          </div>
          <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
            Buscar Materiais e Ofícios Locais
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ex: tijolo ecológico, concreto, madeira FSC..."
          className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface focus:outline-none focus:border-primary"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full sm:w-48 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md font-body-md text-on-surface appearance-none cursor-pointer"
        >
          <option value="">Todas as categorias</option>
          <option value="tijolo ecológico">Tijolo Ecológico</option>
          <option value="madeira">Madeira FSC</option>
          <option value="cobertura">Cobertura / Telhado</option>
          <option value="revestimento">Revestimento</option>
          <option value="concreto">Concreto / Estrutura</option>
          <option value="esquadria">Esquadria</option>
          <option value="argamassa">Argamassa</option>
        </select>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary hover:bg-tertiary-container transition-all shadow-sm text-label-md font-label-md font-bold disabled:opacity-60"
        >
          <Icon name="search" className="text-[18px]" />
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <p className="text-body-sm font-body-sm text-error">
          {error}. <span className="text-on-surface-variant">O catálogo ainda é prototípico; futuras versões conectarão bases oficiais e Google Places via Caddy.</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant tactile-card space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-title-md font-title-md font-semibold text-on-surface">{s.name}</h4>
                <p className="text-label-sm font-label-sm text-secondary uppercase tracking-wider">{s.category}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-bold">
                {s.region}
              </span>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant">{s.notes}</p>
            <div className="flex flex-wrap gap-2">
              {s.material_ids.map((id) => (
                <span
                  key={id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-label-sm font-label-sm font-medium"
                >
                  {findMaterialName(id)}
                </span>
              ))}
            </div>
            <div className="pt-2 border-t border-outline-variant/40 text-body-sm font-body-sm text-on-surface-variant space-y-1">
              <p className="flex items-center gap-1">
                <Icon name="location_on" className="text-[14px] text-primary" />
                {s.city}, {s.state}
              </p>
              {s.phone && <p>📞 {s.phone}</p>}
              {s.email && <p>✉ {s.email}</p>}
              {s.website && <p>🌐 {s.website}</p>}
            </div>
          </div>
        ))}
      </div>

      <p className="text-label-sm font-label-sm text-on-surface-variant">
        Fornecedores são referências prototípicas. Valide contatos, certificações e disponibilidade antes de contratar.
      </p>
    </section>
  );
}
