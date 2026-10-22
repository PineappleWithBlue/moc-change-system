import { ApiResponse } from '@/types/moc';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const AUTH_TOKEN_KEY = 'MOC_AUTH_TOKEN';
export const CURRENT_USER_KEY = 'MOC_CURRENT_USER';

export class ApiError extends Error {
  code: number;
  data?: any;

  constructor(message: string, code = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

/**
 * 统一通用 HTTP 请求客户端 (解耦服务层)
 * - 自动读取环境变量 NEXT_PUBLIC_API_BASE_URL
 * - 自动在 Request Headers 注入 Authorization: Bearer <token>
 * - 统一捕获状态码并处理错误
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // 拼接请求 URL
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint;

  // 提取当前测试员工 Token (未来无缝对接到 Azure SSO)
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem(AUTH_TOKEN_KEY) || '';
  }

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    // Next.js 客户端缓存控制
    cache: 'no-store',
  };

  try {
    const response = await fetch(url, config);

    // 尝试解析 JSON
    let resultData: ApiResponse<T>;
    try {
      resultData = await response.json();
    } catch {
      throw new ApiError(`HTTP ${response.status} ${response.statusText}`, response.status);
    }

    if (!response.ok) {
      throw new ApiError(
        resultData?.message || `Request failed with status ${response.status}`,
        resultData?.code || response.status,
        resultData?.data
      );
    }

    return resultData;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err?.message || 'Network request failed', 500);
  }
}

export const apiClient = {
  get: <T>(url: string, headers?: HeadersInit) =>
    request<T>(url, { method: 'GET', headers }),

  post: <T>(url: string, body?: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  put: <T>(url: string, body: any, headers?: HeadersInit) =>
    request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    }),

  delete: <T>(url: string, headers?: HeadersInit) =>
    request<T>(url, { method: 'DELETE', headers }),
};
