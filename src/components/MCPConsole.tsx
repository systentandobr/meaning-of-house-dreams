import { useState } from 'react';
import { callTool } from '../services/mcpService';

interface MCPConsoleProps {
  defaultRegion?: string;
}

export function MCPConsole({ defaultRegion = 'Sudeste' }: MCPConsoleProps) {
  const [tool, setTool] = useState('casa_search_suppliers');
  const [args, setArgs] = useState(`{"region":"${defaultRegion}","state":"SP"}`);
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

  return (
    <section className="bg-surface-container-low rounded-xl border border-outline-variant p-space-xl space-y-space-md shadow-sm" id="mcp">
      <div>
        <h2 className="text-headline-sm font-headline-sm font-semibold text-on-surface">
          Console de Tools Casa dos Sonhos
        </h2>
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
