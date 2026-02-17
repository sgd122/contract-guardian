import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AnalysisResult } from '@cg/shared';
import type { ApiClient } from '../client';
import { createAnalysisService } from '../services/analysis';
import { queryKeys } from '../query-keys';
import { getBrowserClient } from './use-auth';

interface UseAnalysesReturn {
  analyses: AnalysisResult[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  removeAnalysis: (id: string) => void;
}

export function useAnalyses(client: ApiClient): UseAnalysesReturn {
  const queryClient = useQueryClient();
  const service = useMemo(() => createAnalysisService(client), [client]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.analyses.all,
    queryFn: () => service.listAnalyses(),
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.analyses.all });
  }, [queryClient]);

  const removeAnalysis = useCallback((id: string) => {
    queryClient.setQueryData<AnalysisResult[]>(
      queryKeys.analyses.all,
      (old) => old?.filter((a) => a.id !== id),
    );
  }, [queryClient]);

  return {
    analyses: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refresh,
    removeAnalysis,
  };
}

interface UseAnalysisReturn {
  analysis: AnalysisResult | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const TERMINAL_STATUSES = new Set(['completed', 'failed']);
const FALLBACK_POLL_INTERVAL = 30_000;

export function useAnalysis(
  client: ApiClient,
  id: string | null,
): UseAnalysisReturn {
  const queryClient = useQueryClient();
  const service = useMemo(() => createAnalysisService(client), [client]);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.analyses.detail(id ?? ''),
    queryFn: () => service.getAnalysis(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status && TERMINAL_STATUSES.has(status)) return false;
      return FALLBACK_POLL_INTERVAL;
    },
  });

  const refresh = useCallback(async () => {
    if (!id) return;
    await queryClient.invalidateQueries({
      queryKey: queryKeys.analyses.detail(id),
    });
  }, [queryClient, id]);

  // Realtime subscription — invalidates query on DB change
  useEffect(() => {
    if (!id) return;

    const supabase = getBrowserClient();
    const channel = supabase
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
          queryClient.invalidateQueries({
            queryKey: queryKeys.analyses.detail(id),
          });
          queryClient.invalidateQueries({
            queryKey: queryKeys.analyses.all,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return {
    analysis: data ?? null,
    loading: isLoading,
    error: error as Error | null,
    refresh,
  };
}
