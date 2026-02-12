import type { ApiClient } from '../client';
import { API_ROUTES } from '@cg/shared';

export function createReportService(client: ApiClient) {
  return {
    async downloadReport(analysisId: string): Promise<Blob> {
      const response = await client.get<Response>(
        API_ROUTES.report(analysisId),
      );
      return response.blob();
    },
  };
}
