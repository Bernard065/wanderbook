import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CreditCard,
  DollarSign,
  MapPin,
  Package,
  List,
  Plus,
} from 'lucide-react';

import { AddExpenseDialog } from '@/components/add-expense-dialog';
import { ExpenseRow } from '@/components/expense-row';
import { PageHeader } from '@/components/ui/page-header';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses } from '@/hooks/use-expenses';
import { useTrips } from '@/hooks/use-trips';
import type { Expense } from '@/hooks/use-expenses';
import type { Trip } from '@org/types';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'flights', label: 'Flights' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'activities', label: 'Activities' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
] as const;

type ExpensePageCategory = (typeof CATEGORY_OPTIONS)[number]['value'];

function normalizeCategory(
  category: string | null | undefined,
): ExpensePageCategory {
  const value = category?.toLowerCase() ?? 'other';

  if (['accommodation'].includes(value)) return 'accommodation';
  if (['food'].includes(value)) return 'food';
  if (['transport', 'fuel', 'parking'].includes(value)) return 'transport';
  if (['shopping'].includes(value)) return 'shopping';
  if (
    ['entrance_fee', 'tips', 'visa', 'insurance', 'equipment'].includes(value)
  )
    return 'activities';
  if (['flights', 'flight'].includes(value)) return 'flights';
  return 'other';
}

function getTripLabel(
  tripId: string | null | undefined,
  tripsById: Map<string, Trip>,
) {
  if (!tripId) {
    return 'Unassigned';
  }

  return tripsById.get(tripId)?.name ?? 'Unknown trip';
}

export function ExpensesPage() {
  const [categoryFilter, setCategoryFilter] =
    useState<ExpensePageCategory>('all');
  const [tripFilter, setTripFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: expenses, isLoading: isExpensesLoading, error } = useExpenses();
  const { data: trips, isLoading: isTripsLoading } = useTrips();

  const tripsById = useMemo(
    () => new Map((trips ?? []).map((trip) => [trip.id, trip])),
    [trips],
  );

  const filteredExpenses = useMemo(() => {
    if (!expenses) {
      return [] as Expense[];
    }

    return expenses.filter((expense) => {
      const expenseTime = new Date(expense.expenseDate).getTime();
      const matchesCategory =
        categoryFilter === 'all' ||
        normalizeCategory(expense.category) === categoryFilter;
      const matchesTrip = tripFilter === 'all' || expense.tripId === tripFilter;
      const matchesStartDate =
        !startDate || expenseTime >= new Date(startDate).getTime();
      const matchesEndDate =
        !endDate || expenseTime <= new Date(endDate).getTime();

      return (
        matchesCategory && matchesTrip && matchesStartDate && matchesEndDate
      );
    });
  }, [categoryFilter, endDate, expenses, startDate, tripFilter]);

  const expenseCurrency =
    filteredExpenses[0]?.currency ?? expenses?.[0]?.currency ?? 'USD';

  const totalSpent = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const activeBudget = useMemo(() => {
    if (!trips || trips.length === 0) {
      return 0;
    }

    if (tripFilter !== 'all') {
      return trips.find((trip) => trip.id === tripFilter)?.budget ?? 0;
    }

    if (filteredExpenses.length === 0) {
      return trips.reduce((sum, trip) => sum + (trip.budget ?? 0), 0);
    }

    const referencedTripIds = new Set(
      filteredExpenses
        .map((expense) => expense.tripId)
        .filter((id): id is string => Boolean(id)),
    );

    return trips.reduce(
      (sum, trip) =>
        referencedTripIds.has(trip.id) ? sum + (trip.budget ?? 0) : sum,
      0,
    );
  }, [filteredExpenses, tripFilter, trips]);

  const budgetRemaining =
    activeBudget > 0 ? Math.max(0, activeBudget - totalSpent) : 0;

  const categoryAggregates = useMemo(() => {
    const totals: Record<ExpensePageCategory, number> = {
      all: 0,
      flights: 0,
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      shopping: 0,
      other: 0,
    };

    filteredExpenses.forEach((expense) => {
      const normalized = normalizeCategory(expense.category);
      totals[normalized] += expense.amount;
      totals.all += expense.amount;
    });

    return CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map(
      ({ value, label }) => ({
        category: value,
        label,
        amount: totals[value],
      }),
    );
  }, [filteredExpenses]);

  const tripSpending = useMemo(() => {
    const totals = new Map<string, number>();

    filteredExpenses.forEach((expense) => {
      const tripId = expense.tripId ?? 'unassigned';
      totals.set(tripId, (totals.get(tripId) ?? 0) + expense.amount);
    });

    return Array.from(totals.entries())
      .map(([tripId, amount]) => ({
        tripId,
        name: getTripLabel(tripId === 'unassigned' ? null : tripId, tripsById),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredExpenses, tripsById]);

  const recentExpenses = useMemo(
    () =>
      [...filteredExpenses]
        .sort(
          (a, b) =>
            new Date(b.expenseDate).getTime() -
            new Date(a.expenseDate).getTime(),
        )
        .slice(0, 5),
    [filteredExpenses],
  );

  const topCategoryAmount = Math.max(
    ...categoryAggregates.map((item) => item.amount),
    0,
  );
  const topTripAmount = Math.max(...tripSpending.map((item) => item.amount), 0);

  const isLoading = isExpensesLoading || isTripsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track spending across trips and categories to stay on budget while traveling."
        action={
          <AddExpenseDialog>
            <Button>
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </AddExpenseDialog>
        }
      />

      <SurfaceCard>
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] xl:grid-cols-[2fr_1fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Date range</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.currentTarget.value)}
                  aria-label="Start date"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.currentTarget.value)}
                  aria-label="End date"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Trip</p>
              <div className="mt-3">
                <Select value={tripFilter} onValueChange={setTripFilter}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="All trips" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All trips</SelectItem>
                    {(trips ?? []).map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">Category</p>
              <div className="mt-3">
                <Select
                  value={categoryFilter}
                  onValueChange={(value) =>
                    setCategoryFilter(value as ExpensePageCategory)
                  }
                >
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="hidden xl:block" />
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3 text-slate-600">
              <CalendarDays className="h-5 w-5" />
              <div>
                <p className="text-sm font-medium">Active filters</p>
                <p className="text-xs text-slate-500">
                  {categoryFilter !== 'all' &&
                    `${CATEGORY_OPTIONS.find((option) => option.value === categoryFilter)?.label ?? ''}`}
                  {categoryFilter !== 'all' && tripFilter !== 'all'
                    ? ' · '
                    : ''}
                  {tripFilter !== 'all' && tripsById.get(tripFilter)?.name}
                  {categoryFilter === 'all' && tripFilter === 'all'
                    ? 'Showing all expenses'
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Total spent</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: expenseCurrency,
                }).format(totalSpent)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            Total spending during the active filter period.
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Budget remaining</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: expenseCurrency,
                }).format(budgetRemaining)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            {activeBudget > 0 ? (
              <>
                Based on a total budget of{' '}
                {new Intl.NumberFormat(undefined, {
                  style: 'currency',
                  currency: expenseCurrency,
                }).format(activeBudget)}
                .
              </>
            ) : (
              'No budget is currently set for the active trip selection. Add budgets to your trips to see real totals.'
            )}
          </p>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">
                {filteredExpenses.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <List className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            Expenses in the currently selected date, trip, and category filters.
          </p>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <SurfaceCard>
          <SectionHeader
            title="Spending by category"
            description="Compare how your travel spending is distributed across categories."
          />

          <div className="mt-6 space-y-4">
            {categoryAggregates.map((category) => {
              const width = topCategoryAmount
                ? Math.round((category.amount / topCategoryAmount) * 100)
                : 0;
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>{category.label}</span>
                    <span className="font-medium text-slate-900">
                      {new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: expenseCurrency,
                      }).format(category.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-200"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionHeader
            title="Spending by trip"
            description="Track which trips have the highest expense totals."
          />

          <div className="mt-6 space-y-4">
            {tripSpending.length > 0 ? (
              tripSpending.map((trip) => {
                const width = topTripAmount
                  ? Math.round((trip.amount / topTripAmount) * 100)
                  : 0;
                return (
                  <div key={trip.tripId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span className="truncate">{trip.name}</span>
                      <span className="font-medium text-slate-900">
                        {new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: expenseCurrency,
                        }).format(trip.amount)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-200"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">
                No trip spending found for the current filter.
              </p>
            )}
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionHeader
              title="Recent expenses"
              description="View your latest transactions and update them as needed."
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
              <MapPin className="h-4 w-4" />
              {trips?.length
                ? `${trips.length} trips available`
                : 'Loading trips...'}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
              <Package className="h-4 w-4" />
              {filteredExpenses.length} expenses
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No expenses match the selected filters.
            </div>
          )}
        </div>
      </SurfaceCard>

      {error ? (
        <p className="text-sm text-red-600">Unable to load expenses.</p>
      ) : null}
    </div>
  );
}
