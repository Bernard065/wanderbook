import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = useAuthStore.getState().token;
  const isFormData = options?.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    // Try to include server response body (text or JSON) to aid debugging in UI
    let serverMessage = '';
    try {
      const text = await res.text();
      if (text) {
        try {
          const json = JSON.parse(text);
          // prefer common message fields
          serverMessage = json.detail ?? json.message ?? JSON.stringify(json);
        } catch {
          serverMessage = text;
        }
      }
    } catch {
      serverMessage = '';
    }

    throw new Error(
      `Request failed: ${res.status}${serverMessage ? ` — ${serverMessage}` : ''}`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
