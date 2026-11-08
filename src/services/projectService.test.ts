import { afterEach, describe, expect, it, vi } from 'vitest';
import { projectService, normalizeProject } from './projectService';
import { HttpError } from './api/httpClient';
import type { Project } from '../domain/project';

function mockResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('projectService study endpoints', () => {
  it('preview POSTs the raw input to /api/v1/preview', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, { valid: true, issues: [], project: { id: 'p1' }, educational_only: true })
    );
    vi.stubGlobal('fetch', fetchMock);

    const input = { name: 'preview', region: 'Sudeste', lot_width: 12, lot_depth: 25 };
    const res = await projectService.preview(input as never);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/preview');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({ lot_width: 12, lot_depth: 25 });
    expect(res.valid).toBe(true);
  });

  it('validate POSTs to /api/v1/projects/validate', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, { valid: false, issues: [{ field: 'name', code: 'required', message: 'obrigatório', severity: 'error' }] })
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await projectService.validate({ region: 'Sudeste' } as never);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/projects/validate');
    expect(res.valid).toBe(false);
    expect(res.issues[0].code).toBe('required');
  });

  it('studies GETs /api/v1/projects/:id/studies', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, { project_id: 'p1', studies: { meta: { schema_version: 1 } }, educational_only: true })
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await projectService.studies('p1');
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/projects/p1/studies');
    expect(res.project_id).toBe('p1');
  });

  it('create propagates structured 422 issues', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockResponse(422, {
          error: 'dados inválidos',
          issues: [{ field: 'lot_shape', code: 'enum', message: 'formato inválido', severity: 'error' }],
        })
      )
    );

    const err = (await projectService.create({ name: 'x' } as never).catch((e) => e)) as HttpError;
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(422);
    expect(err.issues[0].field).toBe('lot_shape');
  });
});

describe('normalizeProject', () => {
  it('coerces Go nil slices (JSON null) to empty arrays across the dossier', () => {
    // Simulates a backend response where empty slices serialized as null.
    const raw = {
      id: 'p1',
      phases: null,
      materials: null,
      room_schedule: { rooms: null, issues: null },
      studies: {
        meta: {},
        site: { findings: null, references: null },
        foundation: { findings: null, references: null },
        structure: { findings: null, references: null, span_warnings: null },
        quantitatives: null,
        budget: { groups: null, per_room: null, findings: null, references: null },
        schedule: { phases: null, findings: null, references: null },
        quality: { checks: null, findings: null },
        viability: { igo: 55, seal: 'bronze', dimensions: null, findings: null },
        sustainability: { cbs_detail: null, features: null, references: null },
        disclaimers: null,
      },
    } as unknown as Project;

    const p = normalizeProject(raw);

    expect(p.phases).toEqual([]);
    expect(p.room_schedule.issues).toEqual([]);
    expect(p.studies!.viability.dimensions).toEqual([]);
    expect(p.studies!.viability.findings).toEqual([]);
    expect(p.studies!.budget.per_room).toEqual([]);
    expect(p.studies!.schedule.phases).toEqual([]);
    expect(p.studies!.disclaimers).toEqual([]);
  });

  it('normalizes projects returned by getById', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockResponse(200, {
          id: 'p1',
          studies: { viability: { igo: 60, dimensions: null, findings: null } },
        })
      )
    );
    const p = await projectService.getById('p1');
    expect(p.studies!.viability.findings).toEqual([]);
  });
});
