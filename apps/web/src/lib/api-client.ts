import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  status: number;
  serverMessage: string;

  constructor(status: number, serverMessage: string) {
    super(serverMessage || `Request failed: ${status}`);
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

function flattenErrorValue(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === 'string') return [value];
  if (typeof value === 'number' || typeof value === 'boolean')
    return [String(value)];
  if (Array.isArray(value)) {
    return value.flatMap(flattenErrorValue);
  }
  if (typeof value === 'object') {
    return Object.values(value).flatMap(flattenErrorValue);
  }
  return [String(value)];
}

function parseApiErrorMessage(text: string): string {
  if (!text) return '';

  try {
    const json = JSON.parse(text);

    if (typeof json === 'string') return json;
    if (typeof json.detail === 'string') return json.detail;
    if (typeof json.message === 'string') return json.message;
    if (typeof json.error === 'string') return json.error;
    if (typeof json.errors === 'string') return json.errors;

    if (json.errors !== undefined) {
      return flattenErrorValue(json.errors).filter(Boolean).join(', ');
    }

    if (typeof json === 'object' && json !== null) {
      const textFields = ['title', 'description', 'error_description'];
      for (const field of textFields) {
        const fieldValue = (json as Record<string, unknown>)[field];
        if (typeof fieldValue === 'string') {
          return fieldValue;
        }
      }
    }

    return text.trim();
  } catch {
    return text.trim();
  }
}

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

    let serverMessage = '';
    try {
      const text = await res.text();
      serverMessage = parseApiErrorMessage(text);
    } catch {
      serverMessage = '';
    }

    throw new ApiError(res.status, serverMessage);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
