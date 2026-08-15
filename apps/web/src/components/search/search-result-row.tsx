import { Link } from 'react-router';
import type { LucideIcon } from 'lucide-react';

interface BaseSearchResultRowProps {
  id?: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
  active?: boolean;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  role?: string;
  ariaSelected?: boolean;
  dataIndex?: number;
}

interface SearchResultLinkProps extends BaseSearchResultRowProps {
  asLink: true;
  to: string;
}

interface SearchResultButtonProps extends BaseSearchResultRowProps {
  asLink?: false;
  to?: never;
}

type SearchResultRowProps =
  | SearchResultLinkProps
  | SearchResultButtonProps;

const getRowClassName = (active: boolean) =>
  [
    'flex w-full items-center gap-3 px-4 py-3 text-left text-sm',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-inset focus-visible:ring-blue-500',
    active ? 'bg-blue-50' : 'hover:bg-muted',
  ].join(' ');

export function SearchResultRow({
  id,
  icon: Icon,
  label,
  subtitle,
  active = false,
  onMouseDown,
  onMouseEnter,
  role,
  ariaSelected,
  dataIndex,
  ...props
}: SearchResultRowProps) {
  const className = getRowClassName(active);

  const content = (
    <>
      <Icon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">
          {label}
        </p>

        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </>
  );

  const handleMouseDown = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    event.preventDefault();
    onMouseDown?.();
  };

  if (props.asLink) {
    return (
      <Link
        id={id}
        to={props.to}
        role={role}
        aria-selected={ariaSelected}
        data-index={dataIndex}
        className={className}
        onMouseEnter={onMouseEnter}
        onMouseDown={handleMouseDown}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type="button"
      role={role}
      aria-selected={ariaSelected}
      data-index={dataIndex}
      className={className}
      onMouseEnter={onMouseEnter}
      onMouseDown={handleMouseDown}
    >
      {content}
    </button>
  );
}
