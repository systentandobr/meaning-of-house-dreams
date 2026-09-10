import type { Material } from '../domain/material';
import type { Project } from '../domain/project';

export interface PlanData {
  project: Project;
  materials: Material[];
}

export function exportMarkdownPlan(plan: PlanData): void {
  const { project, materials } = plan;
  const selectedMaterials = materials.filter((m) => project.selected_material_ids.includes(m.id));

  const lines: string[] = [
    `# Plano Consolidado - ${project.name}`,
    '',
    `**Região:** ${project.region} (${project.bioclimatic_zone})`,
    `**Cidade/UF:** ${project.city || '—'} / ${project.state_code || '—'}`,
    `**Área construída:** ${project.area_m2} m²`,
    `**Orçamento estimado:** R$ ${project.budget.toLocaleString('pt-BR')}`,
    `**Data:** ${new Date().toLocaleDateString('pt-BR')}`,
    '',
    '> Este documento é **protótipo educacional**. Decisões estruturais, elétricas, hidráulicas e orçamentárias devem ser validadas por profissionais habilitados.',
    '',
    '## 1. Resumo de Viabilidade',
    '',
    `- **CBS Consolidado:** ${project.cbs.toFixed(1)}`,
    `- **IGO Consolidado:** ${project.igo.toFixed(1)}`,
    `- **Pavimentos:** ${project.stories} | **Quartos:** ${project.rooms} | **Jardim:** ${project.has_garden ? 'Sim' : 'Não'}`,
    '',
    '## 2. Materiais selecionados',
    '',
    '| Material | Unidade | Preço regional (R$) | CO₂ kg/un | Vida útil (anos) |',
    '|----------|---------|--------------------|-----------|-----------------|',
  ];

  for (const m of selectedMaterials) {
    const price = m.prices_per_region[project.region];
    lines.push(
      `| ${m.name} | ${m.unit} | ${price !== undefined ? price.toFixed(2) : '—'} | ${m.co2_kg_per_unit} | ${m.lifespan_years} |`,
    );
  }

  lines.push('', '## 3. Fases da obra', '');
  for (const phase of project.phases) {
    lines.push(
      `### ${phase.order}. ${phase.name} (mês ${phase.start_month} - ${phase.end_month})`,
      '',
      `${phase.description}`,
      '',
      `- **Status:** ${phase.status}`,
      `- **Duração:** ${phase.duration_months} mês(es)`,
      `- **Nota de sustentabilidade:** ${phase.sustainability_notes}`,
      '',
      'Tarefas:',
      ...phase.tasks.map((t) => `- [${t.completed ? 'x' : ' '}] ${t.name}`),
      '',
    );
  }

  lines.push(
    '',
    '---',
    '',
    `Fonte: Catálogo Casa dos Sonhos v${materials.length > 0 ? materials[0]?.source_note : 'protótipo'}.`,
    'Valores aproximados. Sempre consultar engenheiro, arquiteto e orçamentista habilitados antes de executar.',
  );

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plano-${project.name.toLowerCase().replace(/\s+/g, '-')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
