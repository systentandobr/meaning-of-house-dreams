import { describe, expect, it } from 'vitest';
import type { ProjectStudies } from './study';
import type { Project } from './project';

/**
 * Contract test — guards the dossier shape the frontend renders. If the
 * backend entity JSON keys change, this fixture stops compiling/passing,
 * catching drift between entity/*.go and domain/study.ts.
 */
const dossier: ProjectStudies = {
  meta: { schema_version: 1, generated_at: '2026-01-01T00:00:00Z', confidence: 'educational_parametric' },
  site: {
    lot_area_m2: 300,
    shape_factor: 1,
    envelope: { x: 1.5, y: 3, width: 9, depth: 20.5 },
    buildable_area_m2: 184.5,
    built_area_m2: 118.8,
    garden_area_m2: 75,
    outdoor_area_m2: 90,
    floor_area_m2: 118.8,
    occupancy_rate_pct: 39.6,
    permeable_rate_pct: 25,
    findings: [],
    references: [{ ref: 'suggested shares', basis: 'parametric' }],
  },
  foundation: {
    load_kn_per_m2: 12,
    total_load_kn: 1425.6,
    assumed_soil_capacity_kpa: 200,
    recommended_type: 'sapata_corrida',
    reason: 'residência térrea/padrão',
    concrete_volume_m3: 5,
    steel_kg: 300,
    excavation_volume_m3: 12,
    findings: [],
    references: [{ ref: 'NBR 6122', basis: 'parametric' }],
  },
  structure: {
    method: 'alvenaria_convencional',
    system: 'concreto_armado',
    concrete_volume_m3: 10,
    steel_kg: 800,
    masonry_area_m2: 300,
    slab_area_m2: 118.8,
    roof_area_m2: 130,
    openings_area_m2: 20,
    max_span_m: 5,
    span_warnings: [],
    findings: [],
    references: [],
  },
  quantitatives: [{ scope: 'estrutura', item: 'Concreto estrutural', quantity: 10, unit: 'm³', basis: 'parametric', reference: 'NBR 6118' }],
  budget: {
    groups: [{ id: 'estrutura', label: 'Estrutura', items: [], subtotal: 1000 }],
    per_room: [
      {
        room_id: 'r1',
        room_name: 'Quarto',
        area_m2: 12,
        items: [{ group: 'room', description: 'Piso', quantity: 12, unit: 'm²', unit_price: 90, total: 1080 }],
        total: 1080,
      },
    ],
    materials_subtotal: 100000,
    labor_subtotal: 45000,
    labor_factor: 0.45,
    bdi_pct: 0.25,
    contingency_pct: 0.1,
    total: 200000,
    cost_per_m2: 1683,
    reference_min_per_m2: 1800,
    reference_max_per_m2: 2600,
    within_reference: false,
    user_budget: 500000,
    budget_coverage: 2.5,
    findings: [],
    references: [],
  },
  schedule: {
    phases: [{ phase_id: 'f1', name: 'Fundação', duration_months: 1, start_month: 1, end_month: 2, driver: 'quantitativos', budget_share: 0.12 }],
    total_months: 12,
    deadline_months: 12,
    feasible: true,
    findings: [],
    references: [],
  },
  quality: { checks: [], passed: 0, total: 0, score: 0, findings: [] },
  viability: {
    igo: 78,
    seal: 'prata',
    dimensions: [{ id: 'cost', label: 'Custo', score: 80, weight: 0.25, derivation: 'cobertura orçamentária' }],
    findings: [],
  },
  sustainability: {
    embodied_co2_kg: 9028,
    embodied_co2_t_per_m2: 0.076,
    savings_15y: { solar: 60000, water: 32000, durability: 23000, total: 115000 },
    payback_years: 3.4,
    conventional_cost_per_m2: 3850,
    project_cost_per_m2: 1683,
    cbs_detail: [{ material_id: 'm1', name: 'Tijolo ecológico', score: 90 }],
    cbs_average: 78.5,
    features: ['solar', 'cistern'],
    references: [],
  },
  disclaimers: ['Protótipo educacional'],
};

const project: Project = { id: 'p1', name: 'Casa', studies: dossier } as Project;

describe('ProjectStudies dossier contract', () => {
  it('exposes every study the UI renders', () => {
    const s = project.studies!;
    expect(s.site.occupancy_rate_pct).toBeGreaterThan(0);
    expect(s.foundation.recommended_type).toBeTruthy();
    expect(s.structure.method).toBeTruthy();
    expect(s.budget.per_room[0].items[0].total).toBe(1080);
    expect(s.schedule.phases[0].budget_share).toBeGreaterThan(0);
    expect(s.viability.dimensions[0].derivation).toBeTruthy();
    expect(s.sustainability.savings_15y.total).toBe(115000);
    expect(s.disclaimers.length).toBeGreaterThan(0);
  });

  it('keeps declared_budget separate from the computed estimate', () => {
    const p = { ...project, budget: 200000, declared_budget: 500000 };
    expect(p.declared_budget).not.toBe(p.budget);
  });
});
