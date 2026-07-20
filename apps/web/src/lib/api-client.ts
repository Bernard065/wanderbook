import { useAuthStore } from '@/stores/auth-store';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    throw new Error(`Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
