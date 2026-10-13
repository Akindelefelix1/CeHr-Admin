const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'cehr_super_admin_access_token';

export const isPreviewMode = !API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name='ApiError'; this.status=status; }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError('Live API is not configured.', 0);
  const token = sessionStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{ }), ...init.headers },
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) throw new ApiError(String(payload.message || payload.error || 'Request failed.'), response.status);
  return payload as T;
}

export const session = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};
