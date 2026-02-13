import { useState, useEffect, useCallback, useMemo } from 'react';
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

export function useAnalysis(
  client: ApiClient,
  id: string | null,
): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const service = useMemo(() => createAnalysisService(client), [client]);

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

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    // Initial fetch via API
    refresh();

    // Subscribe to realtime updates instead of polling
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
            // Re-fetch full data via API on any update (ensures consistent shape)
            refresh();
          },
        )
        .subscribe();
    } catch {
      // Realtime unavailable — fall back to no subscription (manual refresh still works)
    }

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [id, refresh]);

  return { analysis, loading, error, refresh };
}
