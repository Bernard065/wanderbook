import type { ComponentPropsWithoutRef } from 'react';
import { extractMessageString } from '@/lib/error-utils';

interface ErrorMessageProps extends ComponentPropsWithoutRef<'p'> {
  error: unknown;
  prefix?: string;
  fallback?: string;
}

export function ErrorMessage({
  error,
  prefix,
  fallback = 'An unexpected error occurred.',
  className = 'text-sm text-red-600 bg-red-50 rounded-md px-3 py-2',
  ...props
}: ErrorMessageProps) {
  const message = extractMessageString(error);
  if (!message) return null;

  return (
    <p className={className} {...props}>
      {prefix ? `${prefix} ${message}` : message}
    </p>
  );
}
