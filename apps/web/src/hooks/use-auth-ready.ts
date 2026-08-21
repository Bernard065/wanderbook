import { useAuthStore } from '@/stores/auth-store';
import { useHasHydrated } from './use-has-hydrated';

export function useAuthReady() {
  const hasHydrated = useHasHydrated();
  const token = useAuthStore((state) => state.token);

  return hasHydrated && Boolean(token);
}