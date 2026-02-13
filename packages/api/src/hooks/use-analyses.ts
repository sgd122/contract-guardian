import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { AnalysisResult } from '@cg/shared';
import type { ApiClient } from '../client';
import { createAnalysisService } from '../services/analysis';
import { getSupabaseConfig } from '../supabase/config';
import { createBrowserClient } from '@supabase/ssr';

interface UseAnalysesReturn {
  analyses: AnalysisResult[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useAnalyses(client: ApiClient): UseAnalysesReturn {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const service = useMemo(() => createAnalysisService(client), [client]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { analyses, loading, error, refresh };
}

interface UseAnalysisReturn {
  analysis: AnalysisResult | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const TERMINAL_STATUSES = new Set(['completed', 'failed']);
const FALLBACK_POLL_INTERVAL = 30_000; // 30s — only used when realtime fails

export function useAnalysis(
  client: ApiClient,
  id: string | null,
): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const service = useMemo(() => createAnalysisService(client), [client]);
  const realtimeConnected = useRef(false);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await service.getAnalysis(id);
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [service, id]);

  // Realtime subscription (primary mechanism)
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    refresh();

    let channel: ReturnType<ReturnType<typeof createBrowserClient>['channel']> | null = null;

    try {
      const config = getSupabaseConfig();
      const supabase = createBrowserClient(config.url, config.anonKey);

      channel = supabase
        .channel(`analysis-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'analyses',
            filter: `id=eq.${id}`,
          },
          () => {
            refresh();
          },
        )
        .subscribe((status) => {
          realtimeConnected.current = status === 'SUBSCRIBED';
        });
    } catch {
      realtimeConnected.current = false;
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [id, refresh]);

  // Fallback polling — only when realtime is NOT connected and status is non-terminal
  useEffect(() => {
    if (!id) return;
    const status = analysis?.status;
    if (status && TERMINAL_STATUSES.has(status)) return;

    const timer = setInterval(() => {
      if (!realtimeConnected.current) {
        refresh();
      }
    }, FALLBACK_POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [id, analysis?.status, refresh]);

  return { analysis, loading, error, refresh };
}
