import { usePlaces } from './use-places';
import { useTrips } from './use-trips';
import { useAllJournalEntries } from './use-journal-entries';
import { usePhotos } from './use-photos';
import { useExpenses } from './use-expenses';
import { useBucketList } from './use-bucket-list';
import { ACHIEVEMENTS, type AchievementStats } from '@/constants/achievements';

const XP_PER_LEVEL = 1000;

function xpForStats(stats: AchievementStats): number {
  return (
    stats.placesCount * 50 +
    stats.countriesCount * 200 +
    stats.tripsCount * 150 +
    stats.journalEntriesCount * 30 +
    stats.photosCount * 10 +
    stats.expensesCount * 5
  );
}

export function useAchievements() {
  const { data: places, isLoading: placesLoading } = usePlaces();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const { data: journalEntries, isLoading: journalLoading } =
    useAllJournalEntries();
  const { data: photos, isLoading: photosLoading } = usePhotos();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: bucketList, isLoading: bucketListLoading } = useBucketList();

  const isLoading =
    placesLoading ||
    tripsLoading ||
    journalLoading ||
    photosLoading ||
    expensesLoading ||
    bucketListLoading;

  const stats: AchievementStats = {
    placesCount: places?.length ?? 0,
    countriesCount: new Set(places?.map((p) => p.country)).size,
    tripsCount: trips?.length ?? 0,
    journalEntriesCount: journalEntries?.length ?? 0,
    photosCount: photos?.length ?? 0,
    expensesCount: expenses?.length ?? 0,
    bucketListVisitedCount:
      bucketList?.filter((item) => item.status === 'visited').length ?? 0,
  };

  const unlockedIds = new Set(
    ACHIEVEMENTS.filter((a) => a.isUnlocked(stats)).map((a) => a.id),
  );

  const xp = xpForStats(stats);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;

  return {
    isLoading,
    stats,
    achievements: ACHIEVEMENTS,
    unlockedIds,
    unlockedCount: unlockedIds.size,
    totalCount: ACHIEVEMENTS.length,
    xp,
    level,
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
  };
}
