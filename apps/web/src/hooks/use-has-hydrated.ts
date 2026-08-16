import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth-store';

/**
 * Tracks whether the persisted Zustand auth store has finished rehydrating
 * from storage. Until this is true, `token`/`isAuthenticated` may not yet
 * reflect the persisted values, so consumers should treat auth state as
 * unknown rather than "logged out".
 */
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? false,
  );

  useEffect(() => {
    // In case hydration finished between the initial state calculation
    // and this effect running.
    setHasHydrated(useAuthStore.persist?.hasHydrated?.() ?? false);

    const unsubFinish = useAuthStore.persist?.onFinishHydration?.(() =>
      setHasHydrated(true),
    );

    return () => {
      unsubFinish?.();
    };
  }, []);

  return hasHydrated;
}
