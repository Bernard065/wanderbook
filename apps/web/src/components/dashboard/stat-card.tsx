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
    <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
          iconClassName ?? 'bg-blue-50 text-blue-600'
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}
