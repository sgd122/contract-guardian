import type { ApiError } from '@cg/shared';

export interface ApiClientConfig {
  baseURL: string;
  getToken?: () => Promise<string | null>;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  postForm<T>(path: string, formData: FormData): Promise<T>;
  delete<T>(path: string): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const { baseURL, getToken } = config;

  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (getToken) {
      const token = await getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    if (
      options.body &&
      typeof options.body === 'string' &&
      !headers.has('Content-Type')
    ) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${baseURL}${path}`, {
      ...options,
      headers,
      credentials: baseURL ? 'include' : 'same-origin',
    });

    if (!response.ok) {
      let error: ApiError;
      try {
        error = await response.json();
      } catch {
        error = {
          code: `HTTP_${response.status}`,
          message: response.statusText,
        };
      }
      throw error;
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType?.includes('application/json')) {
      return response.json() as Promise<T>;
    }

    return response as unknown as T;
  }

  return {
    get<T>(path: string) {
      return request<T>(path, { method: 'GET' });
    },
    post<T>(path: string, body?: unknown) {
      return request<T>(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      });
    },
    postForm<T>(path: string, formData: FormData) {
      return request<T>(path, {
        method: 'POST',
        body: formData,
      });
    },
    delete<T>(path: string) {
      return request<T>(path, { method: 'DELETE' });
    },
  };
}
