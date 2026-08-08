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
    <div className="bg-white border rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">My Passport</h3>
        <Link to="/documents" className="text-xs text-blue-600 font-medium">
          View All
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-20 w-14 rounded-md bg-linear-to-br from-blue-800 to-blue-600 text-white flex items-center justify-center shadow-inner">
          <div className="text-xs font-semibold">Passport</div>
        </div>

        <div className="flex-1">
          <p className="text-sm font-medium">{user?.fullName ?? 'Your Name'}</p>
          <p className="text-xs text-slate-500">
            Explorer Level {level ?? '—'}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-sm font-semibold text-slate-800">{xp ?? 0} XP</p>
          <p className="text-xs text-slate-500">{unlockedCount ?? 0} badges</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        {passportDocs.slice(0, 8).map((d, i) => (
          <div
            key={d.id}
            title={d.fileName}
            className={`h-8 w-8 rounded-full flex items-center justify-center text-[11px] text-white ${
              i % 2 === 0 ? 'bg-red-500' : 'bg-emerald-500'
            } shadow-sm`}
          >
            {String(d.fileName ?? 'S')
              .charAt(0)
              .toUpperCase()}
          </div>
        ))}

        {passportDocs.length === 0 && (
          <div className="text-sm text-slate-500">No passport stamps yet.</div>
        )}
      </div>
    </div>
  );
}

export default PassportCard;
