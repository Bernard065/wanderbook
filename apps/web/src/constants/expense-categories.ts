export const EXPENSE_CATEGORIES = [
  'transport',
  'accommodation',
  'entrance_fee',
  'food',
  'shopping',
  'tips',
  'fuel',
  'parking',
  'insurance',
  'visa',
  'equipment',
  'other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
