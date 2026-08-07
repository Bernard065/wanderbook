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
    <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-white p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          iconClassName ?? 'bg-blue-50 text-blue-600'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="mt-1.5 text-xs leading-tight text-gray-500 wrap-break-word">
          {label}
        </p>
      </div>
    </div>
  );
}
