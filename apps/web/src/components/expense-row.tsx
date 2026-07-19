import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteExpense } from '@/hooks/use-expenses';
import type { Expense } from '@/hooks/use-expenses';

interface ExpenseRowProps {
  expense: Expense;
}

export function ExpenseRow({ expense }: ExpenseRowProps) {
  const { mutate: deleteExpense, isPending } = useDeleteExpense();

  return (
    <div className="flex items-center justify-between gap-3 border rounded-lg px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium capitalize">
          {expense.category.replace(/_/g, ' ')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(expense.expenseDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
          {expense.notes && ` · ${expense.notes}`}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-semibold">
          {expense.currency} {expense.amount.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={isPending}
          onClick={() => deleteExpense(expense.id)}
        >
          <Trash2 className="h-3.5 w-3.5 text-gray-400" />
        </Button>
      </div>
    </div>
  );
}
