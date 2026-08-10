import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories';

export const expenseSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !Number.isNaN(num) && num > 0;
  }, 'Enter a valid amount'),
  currency: z
    .string()
    .min(1, 'Currency is required')
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter currency code'),
  category: z.enum(EXPENSE_CATEGORIES),
  placeId: z.string().optional(),
  tripId: z.string().optional(),
  notes: z.string().optional(),
  expenseDate: z.string().min(1, 'Date is required'),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
