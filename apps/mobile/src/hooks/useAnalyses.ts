import { useState, useEffect, useCallback } from 'react';
import type { AnalysisResult } from '@cg/shared';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../providers/AuthProvider';

interface UseAnalysesReturn {
  analyses: AnalysisResult[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAnalyses(): UseAnalysesReturn {
  const { user } = useAuthContext();
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!user) {
      setAnalyses([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw new Error(queryError.message);
      }

      setAnalyses((data as AnalysisResult[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!user) {
        if (isMounted) {
          setAnalyses([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
        }

        const { data, error: queryError } = await supabase
          .from('analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (queryError) {
          throw new Error(queryError.message);
        }

        setAnalyses((data as AnalysisResult[]) ?? []);
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

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return { analyses, isLoading, error, refetch };
}
