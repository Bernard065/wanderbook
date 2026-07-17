import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import { useAuthStore, type AuthUser } from '@/stores/auth-store';

interface TokenResponse {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiRequest<TokenResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
    },
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiRequest<TokenResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
    },
  });
}
