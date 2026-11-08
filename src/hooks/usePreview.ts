import { useEffect, useRef, useState } from 'react';
import { projectService } from '../services/projectService';
import type { CreateProjectInput } from '../domain/project';
import type { FieldIssue, SiteStudy } from '../domain/study';

export interface SitePreviewInput {
  region: string;
  lotWidth: number;
  lotDepth: number;
  lotShape: string;
  stories: number;
}

export interface SitePreview {
  site: SiteStudy | null;
  issues: FieldIssue[];
  loading: boolean;
}

/**
 * Debounced call to POST /api/v1/preview — the backend computes lot areas,
 * envelope and validation issues; the wizard only renders them.
 */
export function useSitePreview(input: SitePreviewInput, delayMs = 400): SitePreview {
  const [state, setState] = useState<SitePreview>({ site: null, issues: [], loading: false });
  const seq = useRef(0);

  useEffect(() => {
    if (input.lotWidth <= 0 || input.lotDepth <= 0) {
      setState({ site: null, issues: [], loading: false });
      return;
    }
    const current = ++seq.current;
    setState((s) => ({ ...s, loading: true }));
    const timer = setTimeout(async () => {
      const body: CreateProjectInput = {
        name: 'preview',
        region: input.region,
        lot_width: input.lotWidth,
        lot_depth: input.lotDepth,
        lot_shape: input.lotShape,
        stories: input.stories,
      };
      try {
        const res = await projectService.preview(body);
        if (seq.current !== current) return;
        setState({ site: res.project?.studies?.site ?? null, issues: res.issues ?? [], loading: false });
      } catch {
        if (seq.current === current) {
          setState({ site: null, issues: [], loading: false });
        }
      }
    }, delayMs);
    return () => clearTimeout(timer);
  }, [input.region, input.lotWidth, input.lotDepth, input.lotShape, input.stories, delayMs]);

  return state;
}
