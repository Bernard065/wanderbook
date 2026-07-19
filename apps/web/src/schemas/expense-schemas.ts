import { z } from 'zod';
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories';

export const expenseSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !Number.isNaN(num) && num > 0;
  }, 'Enter a valid amount'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.enum(EXPENSE_CATEGORIES),
  notes: z.string().optional(),
  expenseDate: z.string().min(1, 'Date is required'),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
