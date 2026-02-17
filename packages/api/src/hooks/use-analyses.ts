import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AnalysisResult } from '@cg/shared';
import { queryKeys } from '../query-keys';
import { getBrowserClient } from './use-auth';

interface UseAnalysesOptions {
  queryFn: () => Promise<AnalysisResult[]>;
}

interface UseAnalysesReturn {
  analyses: AnalysisResult[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  removeAnalysis: (id: string) => Promise<void>;
}

export function useAnalyses(options: UseAnalysesOptions): UseAnalysesReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.analyses.all,
    queryFn: options.queryFn,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete analysis');
      return id;
    },
    onMutate: async (id: string) => {
      // Cancel in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.analyses.all });

      // Snapshot current data for rollback
      const previous = queryClient.getQueryData<AnalysisResult[]>(queryKeys.analyses.all);

      // Optimistically remove the item
      queryClient.setQueryData<AnalysisResult[]>(
        queryKeys.analyses.all,
        (old) => old?.filter((a) => a.id !== id) ?? [],
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      // Rollback to previous data on failure
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.analyses.all, context.previous);
      }
    },
    onSettled: () => {
      // Always refetch after mutation to ensure server sync
      queryClient.invalidateQueries({ queryKey: queryKeys.analyses.all });
    },
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.analyses.all });
  }, [queryClient]);

  const removeAnalysis = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    analyses: data ?? [],
    loading: isLoading,
    error: error as Error | null,
    refresh,
    removeAnalysis,
  };
}

interface UseAnalysisOptions {
  queryFn: (id: string) => Promise<AnalysisResult | null>;
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
  id: string | null,
  options: UseAnalysisOptions,
): UseAnalysisReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.analyses.detail(id ?? ''),
    queryFn: () => options.queryFn(id!),
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
