import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface SearchSectionProps {
  icon: LucideIcon;
  title: string;
  count: number;
  children: ReactNode;
}

export function SearchSection({
  icon: Icon,
  title,
  count,
  children,
}: SearchSectionProps) {
  return (
    <section aria-labelledby={`${title}-search-section`}>
      <div className="mb-4 flex items-center gap-2">
        <Icon
          aria-hidden="true"
          className="size-5 shrink-0 text-slate-600"
        />

        <h2
          id={`${title}-search-section`}
          className="text-lg font-semibold text-foreground"
        >
          {title}
        </h2>

        <span
          aria-label={`${count} ${count === 1 ? 'result' : 'results'}`}
          className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-slate-600"
        >
          {count}
        </span>
      </div>

      {children}
    </section>
  );
}
