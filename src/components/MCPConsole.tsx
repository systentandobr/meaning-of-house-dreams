import { useState } from 'react';
import { Icon } from './Icon';
import { callTool } from '../services/mcpService';
import { useAppStore } from '../store/appStore';

const PRESETS = [
  { name: 'Clima', tool: 'casa_clima_por_municipio', args: '{"city":"São Paulo","uf":"SP"}' },
  { name: 'Materiais', tool: 'casa_listar_materiais', args: '{"region":"Sudeste"}' },
  { name: 'CBS', tool: 'casa_calcular_cbs', args: '{"material_id":"tijolo-ecologico","region":"Sudeste"}' },
  { name: 'Fornecedores', tool: 'casa_search_suppliers', args: '{"region":"Sudeste","state":"SP"}' },
];

export function MCPConsole() {
  const { region } = useAppStore();
  const [tool, setTool] = useState('casa_search_suppliers');
  const [args, setArgs] = useState(`{"region":"${region}","state":"SP"}`);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const parsed = JSON.parse(args);
      const text = await callTool(tool, parsed);
      setResult(text);
    } catch (e: any) {
      setResult(`Erro: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setTool(p.tool);
    setArgs(p.args.replace('Sudeste', region));
  }

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm" id="mcp">
      <div>
        <div className="flex items-center gap-2 text-label-sm font-label-sm font-bold text-secondary uppercase tracking-wider">
          <Icon name="hub" className="text-[16px]" />
          webMCP / Assistente
        </div>
        <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
          Console de Tools Casa dos Sonhos
        </h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-label-sm hover:border-primary"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          placeholder="Nome da tool"
          className="sm:w-64 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md"
        />
        <textarea
          value={args}
          onChange={(e) => setArgs(e.target.value)}
          rows={1}
          placeholder='{"chave":"valor"}'
          className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-body-md resize-none min-h-[40px]"
        />
        <button
          onClick={run}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-sm disabled:opacity-60"
        >
          {loading ? '...' : 'Chamar'}
        </button>
      </div>

      {result && (
        <pre className="p-3 rounded-lg bg-surface-container border border-outline-variant text-body-sm text-on-surface overflow-auto max-h-96">
          {result}
        </pre>
      )}
    </section>
  );
}
