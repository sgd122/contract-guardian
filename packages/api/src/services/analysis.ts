import type { ApiClient } from '../client';
import type { AnalysisResult, AnalyzeRequest, AnalyzeResponse } from '@cg/shared';
import { API_ROUTES } from '@cg/shared';

export function createAnalysisService(client: ApiClient) {
  return {
    async createAnalysis(analysisId: string): Promise<AnalyzeResponse> {
      return client.post<AnalyzeResponse>(API_ROUTES.analyze, {
        analysisId,
      } satisfies AnalyzeRequest);
    },

    async getAnalysis(id: string): Promise<AnalysisResult> {
      return client.get<AnalysisResult>(API_ROUTES.analysis(id));
    },

    async listAnalyses(): Promise<AnalysisResult[]> {
      return client.get<AnalysisResult[]>(API_ROUTES.analyses);
    },
  };
}
