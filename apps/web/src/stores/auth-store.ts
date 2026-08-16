import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  profilePhotoKey?: string | null;
  profilePhotoUrl?: string | null;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      clearAuth: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'wanderbook-auth',
      // No partialize: every field in AuthState is meant to persist.
      // If a non-persisted field (e.g. a transient `isLoading` flag) is
      // added later, reintroduce partialize to exclude it explicitly.
    },
  ),
);
