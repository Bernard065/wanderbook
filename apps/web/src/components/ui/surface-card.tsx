import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  padded?: boolean;
}

export function SurfaceCard({
  children,
  className,
  elevated = true,
  padded = true,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.22)]',
        elevated && 'shadow-[0_16px_40px_-22px_rgba(15,23,42,0.24)]',
        padded ? 'p-5 sm:p-6' : 'p-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
