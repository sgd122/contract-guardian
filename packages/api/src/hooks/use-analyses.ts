import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalysisResult } from '@cg/shared';
import type { ApiClient } from '../client';
import { createAnalysisService } from '../services/analysis';

interface UseAnalysesReturn {
  analyses: AnalysisResult[];
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
}

export function useAnalyses(client: ApiClient): UseAnalysesReturn {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const service = createAnalysisService(client);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await service.listAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { analyses, loading, error, refresh };
}

interface UseAnalysisReturn {
  analysis: AnalysisResult | null;
  loading: boolean;
  error: unknown;
  refresh: () => Promise<void>;
}

const POLL_INTERVAL = 3_000; // 3 seconds
const TERMINAL_STATUSES = new Set(['completed', 'failed']);

export function useAnalysis(
  client: ApiClient,
  id: string | null,
): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const service = createAnalysisService(client);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const data = await service.getAnalysis(id);
      setAnalysis(data);

      if (TERMINAL_STATUSES.has(data.status) && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [client, id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    refresh();

    intervalRef.current = setInterval(refresh, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [id, refresh]);

  return { analysis, loading, error, refresh };
}
