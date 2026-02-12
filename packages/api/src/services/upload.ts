import type { ApiClient } from '../client';
import type { UploadResponse } from '@cg/shared';
import { API_ROUTES } from '@cg/shared';

export function createUploadService(client: ApiClient) {
  return {
    async uploadFile(file: File): Promise<UploadResponse> {
      const formData = new FormData();
      formData.append('file', file);
      return client.postForm<UploadResponse>(API_ROUTES.upload, formData);
    },
  };
}
