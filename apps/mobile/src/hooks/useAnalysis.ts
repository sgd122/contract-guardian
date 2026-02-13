import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnalysisResult } from '@cg/shared';
import { supabase } from '../lib/supabase';

const POLL_INTERVAL = 3000;
const TERMINAL_STATUSES = new Set(['completed', 'failed']);

interface UseAnalysisReturn {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAnalysis(id: string | null): UseAnalysisReturn {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;

    try {
      setError(null);

      const { data, error: queryError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (queryError) {
        throw new Error(queryError.message);
      }

      const result = data as AnalysisResult;
      setAnalysis(result);
      statusRef.current = result.status;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      setAnalysis(null);
      setIsLoading(false);
      statusRef.current = null;
      return;
    }

    let isMounted = true;
    const pollingIntervalRef = { current: null as NodeJS.Timeout | null };

    const fetchAnalysis = async () => {
      if (!isMounted) return;

      try {
        const { data, error: queryError } = await supabase
          .from('analyses')
          .select('*')
          .eq('id', id)
          .single();

        if (!isMounted) return;

        if (queryError) {
          setError(new Error(queryError.message));
          return;
        }

        const result = data as AnalysisResult;
        setAnalysis(result);
        statusRef.current = result.status;

        if (TERMINAL_STATUSES.has(result.status)) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          return;
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);

    // Fetch first, then start polling
    fetchAnalysis().then(() => {
      if (!isMounted) return;

      // Only start polling if status is not terminal
      if (!statusRef.current || !TERMINAL_STATUSES.has(statusRef.current)) {
        pollingIntervalRef.current = setInterval(fetchAnalysis, POLL_INTERVAL);
      }
    });

    return () => {
      isMounted = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [id]);

  return { analysis, isLoading, error, refetch };
}
