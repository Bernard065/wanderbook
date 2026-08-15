import { ExpenseRow } from '@/components/expense-row';
import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { Button } from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { Plus } from 'lucide-react';
import { useExpenses } from '@/hooks/use-expenses';

interface PlaceExpensesProps {
  placeId: string;
}

export function PlaceExpenses({ placeId }: PlaceExpensesProps) {
  const { data: expenses, isLoading, error } = useExpenses({ placeId });

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Expenses
          {expenses && expenses.length > 0 && (
            <span className="text-muted-foreground font-normal text-base ml-2">
              Total: {expenses[0].currency} {total.toFixed(2)}
            </span>
          )}
        </h2>
        <AddExpenseDialog placeId={placeId}>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </AddExpenseDialog>
      </div>

      {isLoading && <p>Loading expenses...</p>}
      {error && <ErrorMessage error={error} />}
      {expenses?.length === 0 && (
        <p className="text-muted-foreground">No expenses recorded yet.</p>
      )}

      <div className="space-y-2">
        {expenses?.map((expense) => (
          <ExpenseRow key={expense.id} expense={expense} />
        ))}
      </div>
    </div>
  );
}
