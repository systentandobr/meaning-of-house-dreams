import { postJson } from './api/httpClient';

export interface MCPRequest {
  jsonrpc: '2.0';
  id: number;
  method: 'tools/call' | 'tools/list' | 'initialize';
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: {
    content?: Array<{ type: string; text: string }>;
    tools?: unknown[];
  };
  error?: { code: number; message: string };
}

export async function callMCP(req: MCPRequest): Promise<MCPResponse> {
  return postJson<MCPResponse>('/mcp', req);
}

export async function callTool(name: string, arguments_: Record<string, unknown>): Promise<string> {
  const res = await callMCP({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name, arguments: arguments_ },
  });
  if (res.error) {
    throw new Error(res.error.message);
  }
  const content = res.result?.content;
  if (!content || content.length === 0) {
    return '{}';
  }
  return content[0].text;
}
