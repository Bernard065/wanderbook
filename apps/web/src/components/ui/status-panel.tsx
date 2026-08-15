import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface StatusPanelProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatusPanel({
  title,
  description,
  icon,
  tone = 'default',
  className,
  children,
}: StatusPanelProps) {
  const toneClasses = {
    default: 'border bg-muted text-slate-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-700',
    danger: 'border-rose-200 bg-rose-50 text-rose-700',
  } as const;

  return (
    <div className={cn('rounded-2xl border p-5', toneClasses[tone], className)}>
      <div className="flex items-start gap-3">
        {icon ? <div className="shrink-0">{icon}</div> : null}
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="text-sm leading-6 opacity-90">{description}</p>
          ) : null}
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
