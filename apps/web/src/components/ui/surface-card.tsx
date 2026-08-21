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
        'rounded-[28px] border border-slate-200/80 bg-white/75 text-foreground shadow-[0_24px_55px_-28px_rgba(15,23,42,0.22)] backdrop-blur-xl',
        elevated && 'shadow-[0_24px_60px_-32px_rgba(15,23,42,0.28)]',
        padded ? 'p-5 sm:p-6' : 'p-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
