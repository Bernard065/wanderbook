import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value?: number | string;
  unit?: string;
  supportingText?: string;
  iconClassName?: string;
  isLoading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  supportingText,
  iconClassName,
  isLoading = false,
}) => {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-22px_rgba(15,23,42,0.24)]">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            iconClassName ?? 'bg-blue-50 text-blue-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-2xl font-semibold leading-none text-slate-900">
            {isLoading ? (
              <span className="inline-block h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
            ) : (
              <>
                <span>{value}</span>
                {unit ? (
                  <span className="ml-2 text-base font-medium text-slate-500">
                    {unit}
                  </span>
                ) : null}
              </>
            )}
          </p>
          <p className="mt-1 text-sm leading-tight text-slate-600 wrap-break-word">
            {isLoading ? (
              <span className="inline-block h-3 w-28 rounded-full bg-slate-200 animate-pulse" />
            ) : (
              label
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <span className="block h-3 w-full rounded-full bg-slate-200 animate-pulse" />
          <span className="block h-3 w-3/4 rounded-full bg-slate-200 animate-pulse" />
        </div>
      ) : (
        supportingText && (
          <p className="text-sm text-slate-500">{supportingText}</p>
        )
      )}
    </div>
  );
};
