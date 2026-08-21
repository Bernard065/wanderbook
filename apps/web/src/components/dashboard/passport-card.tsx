import { Link } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { useDocuments } from '@/hooks/use-documents';
import { useAchievements } from '@/hooks/use-achievements';

export function PassportCard() {
  const user = useAuthStore((s) => s.user);
  const { data: documents } = useDocuments();
  const passportDocs = (documents ?? []).filter(
    (d) => d.documentType === 'passport',
  );
  const { level, xp, unlockedCount } = useAchievements();

  return (
    <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#0b1220_0%,#172554_100%)] p-4 text-white shadow-[0_30px_72px_-40px_rgba(15,23,42,1)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">My Passport</h3>
        <Link
          to="/documents"
          className="text-xs font-medium text-sky-200 transition hover:text-white"
        >
          View All
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-20 w-16 items-center justify-center rounded-xl border border-white/15 bg-[radial-gradient(circle_at_top,#1e3a8a_0%,#0b1325_45%,#0f172a_100%)] text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
          <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-sky-100">
            Passport
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {user?.fullName ?? 'Your Name'}
          </p>
          <p className="text-xs text-slate-300">
            Explorer Level {level ?? '—'}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-semibold text-white">{xp ?? 0} XP</p>
          <p className="text-[11px] text-slate-300">
            {unlockedCount ?? 0} badges
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {passportDocs.slice(0, 8).map((d, i) => (
          <div
            key={d.id}
            title={d.fileName}
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-[10px] font-semibold text-white shadow-sm ${
              i % 2 === 0
                ? 'bg-[linear-gradient(135deg,#ef4444_0%,#f97316_100%)]'
                : 'bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)]'
            }`}
          >
            {String(d.fileName ?? 'S')
              .charAt(0)
              .toUpperCase()}
          </div>
        ))}

        {passportDocs.length === 0 && (
          <div className="text-sm text-slate-300">No passport stamps yet.</div>
        )}
      </div>
    </div>
  );
}

export default PassportCard;
