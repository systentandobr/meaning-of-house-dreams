import { ENV_CONFIG } from '../../config/env';

const API_BASE = ENV_CONFIG.API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export interface ApiFieldIssue {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export class HttpError extends Error {
  status: number;
  /** Structured validation issues when the backend answers 422. */
  issues: ApiFieldIssue[];
  constructor(message: string, status: number, issues: ApiFieldIssue[] = []) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    let issues: ApiFieldIssue[] = [];
    try {
      const body = await res.json();
      message = body.error || message;
      if (Array.isArray(body.issues)) {
        issues = body.issues;
      }
    } catch {
      /* ignore */
    }
    throw new HttpError(message, res.status, issues);
  }
  return res.json() as Promise<T>;
}

export async function getJson<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
  const qs = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        qs.set(key, String(value));
      }
    }
  }
  const queryString = qs.toString() ? `?${qs.toString()}` : '';
  const res = await fetch(`${API_BASE}${path}${queryString}`);
  return handle<T>(res);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}

export async function putJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handle<T>(res);
}

export async function deleteJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  return handle<T>(res);
}
