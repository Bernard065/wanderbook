import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  action,
  className,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4 rounded-[1.75rem] border border/80 bg-card/95 p-6 shadow-[0_12px_32px_-18px_rgba(15,23,42,0.22)] sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
      {...props}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? (
        <div className="flex shrink-0 items-center">{action}</div>
      ) : null}
      {children}
    </header>
  );
}
