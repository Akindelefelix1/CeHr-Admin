const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'cehr_super_admin_access_token';
const ADMIN_KEY = 'cehr_super_admin_identity';
const API_CACHE_PREFIX = 'cehr_super_admin_cache:';
const API_CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map<string, { expiresAt: number; payload: unknown }>();

export const isPreviewMode = !API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name='ApiError'; this.status=status; }
}

function clearStoredAdminSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_KEY);
  try { Object.keys(sessionStorage).filter(key => key.startsWith(API_CACHE_PREFIX)).forEach(key => sessionStorage.removeItem(key)); } catch { /* Ignore storage failures. */ }
  window.dispatchEvent(new Event('superAdminSessionExpired'));
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_BASE_URL) throw new ApiError('Live API is not configured.', 0);
  const method = String(init.method || 'GET').toUpperCase();
  const token = sessionStorage.getItem(TOKEN_KEY);
  const cacheKey = `${API_CACHE_PREFIX}${token ? token.slice(-24) : 'anonymous'}:${path}`;
  if (method === 'GET') {
    const inMemory = memoryCache.get(cacheKey);
    if (inMemory && inMemory.expiresAt > Date.now()) return inMemory.payload as T;
    if (inMemory) memoryCache.delete(cacheKey);
    try {
      const stored = sessionStorage.getItem(cacheKey);
      if (stored) {
        const parsed = JSON.parse(stored) as { expiresAt: number; payload: unknown };
        if (parsed.expiresAt > Date.now()) {
          memoryCache.set(cacheKey, parsed);
          return parsed.payload as T;
        }
        sessionStorage.removeItem(cacheKey);
      }
    } catch { /* Ignore unavailable/corrupt browser storage and fetch normally. */ }
  } else {
    memoryCache.clear();
    try { Object.keys(sessionStorage).filter(key => key.startsWith(API_CACHE_PREFIX)).forEach(key => sessionStorage.removeItem(key)); } catch { /* Ignore storage failures. */ }
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{ }), ...init.headers },
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    if (response.status === 401 && !path.includes('/auth/login')) {
      clearStoredAdminSession();
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?reason=session-expired');
      }
      throw new ApiError('Your admin session expired. Please sign in again.', 401);
    }
    throw new ApiError(String(payload.message || payload.error || 'Request failed.'), response.status);
  }
  if (method === 'GET') {
    const entry = { expiresAt: Date.now() + API_CACHE_TTL_MS, payload };
    memoryCache.set(cacheKey, entry);
    try { sessionStorage.setItem(cacheKey, JSON.stringify(entry)); } catch { /* Ignore quota/private-mode failures. */ }
  }
  return payload as T;
}

export const session = {
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(ADMIN_KEY); try { Object.keys(sessionStorage).filter(key => key.startsWith(API_CACHE_PREFIX)).forEach(key => sessionStorage.removeItem(key)); } catch { /* Ignore storage failures. */ } },
};
