import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson, postJson, HttpError } from './httpClient';

function mockResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('httpClient', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse(200, { ok: true })));
    await expect(getJson<{ ok: boolean }>('/health')).resolves.toEqual({ ok: true });
  });

  it('throws HttpError with structured issues on 422', async () => {
    const issues = [
      { field: 'lot_width', code: 'min', message: 'largura mínima 6m', severity: 'error' },
      { field: 'budget', code: 'sanity', message: 'orçamento muito baixo', severity: 'warning' },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(mockResponse(422, { error: 'validação falhou', issues }))
    );

    const err = (await postJson('/api/v1/projects', { name: 'x' }).catch((e) => e)) as HttpError;
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(422);
    expect(err.message).toBe('validação falhou');
    expect(err.issues).toEqual(issues);
    expect(err.issues[0].field).toBe('lot_width');
  });

  it('falls back to HTTP status message when body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('oops', { status: 500 })));
    const err = (await getJson('/x').catch((e) => e)) as HttpError;
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(500);
    expect(err.issues).toEqual([]);
  });
});
