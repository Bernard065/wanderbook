import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api-client';
import type { ExpenseCategory } from '@/constants/expense-categories';

export interface Expense {
  id: string;
  placeId: string | null;
  tripId: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  notes: string | null;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseInput {
  placeId?: string;
  tripId?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  notes?: string;
  expenseDate: string;
}

interface UseExpensesOptions {
  placeId?: string;
  tripId?: string;
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const params = new URLSearchParams();
  if (options.placeId) params.set('place_id', options.placeId);
  if (options.tripId) params.set('trip_id', options.tripId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['expenses', options],
    queryFn: () => apiRequest<Expense[]>(`/expenses${qs ? `?${qs}` : ''}`),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      apiRequest<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
