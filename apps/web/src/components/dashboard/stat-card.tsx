import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconClassName?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  iconClassName,
}: StatCardProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_16px_40px_-22px_rgba(15,23,42,0.24)]">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          iconClassName ?? 'bg-blue-50 text-blue-600'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-2xl font-semibold leading-none text-slate-900">
          {value}
        </p>
        <p className="mt-1 text-sm leading-tight text-slate-600 wrap-break-word">
          {label}
        </p>
      </div>
    </div>
  );
}
