import { Link } from 'react-router';
import {
  Globe,
  Plane,
  Camera,
  BookOpen,
  Compass,
  Sparkles,
} from 'lucide-react';
import { TravelStatisticsSection } from '@/components/dashboard/travel-statistics-section';
import { DashboardMapWidget } from '@/components/dashboard/dashboard-map-widget';
import { TripProgressCard } from '@/components/dashboard/trip-progress-card';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
import { PassportCard } from '@/components/dashboard/passport-card';
import { TravelTimeline } from '@/components/dashboard/travel-timeline';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { BucketListPreview } from '@/components/dashboard/bucket-list-preview';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { SurfaceCard } from '@/components/ui/surface-card';
import { AddTripDialog } from '@/components/add-trip-dialog';
import { usePlaces } from '@/hooks/use-places';
import { useTrips } from '@/hooks/use-trips';
import { useAllJournalEntries } from '@/hooks/use-journal-entries';
import { usePhotos } from '@/hooks/use-photos';
import { MemoriesGrid } from '@/components/dashboard/memories-grid';
import { useFlights } from '@/hooks/use-flights';
import { useExpenses } from '@/hooks/use-expenses';
import { useAchievements } from '@/hooks/use-achievements';
export function DashboardPage() {
  const {
    data: places,
    isLoading: placesLoading,
    error: placesError,
    refetch: refetchPlaces,
  } = usePlaces();
  const {
    data: trips,
    isLoading: tripsLoading,
    error: tripsError,
    refetch: refetchTrips,
  } = useTrips();
  const { data: journalEntries } = useAllJournalEntries();
  const { data: photos, isLoading: photosLoading } = usePhotos();
  const { data: flights } = useFlights();
  const { data: expenses } = useExpenses();
  const { unlockedCount, totalCount } = useAchievements();

  const isLoading = placesLoading || tripsLoading;
  const hasError = Boolean(placesError || tripsError);

  const countries = new Set((places ?? []).map((p) => p.country)).size;
  const cities = new Set(
    (places ?? []).map((p) => p.city).filter((c): c is string => !!c),
  ).size;

  const journalCountByPlace = new Map<string, number>();
  journalEntries?.forEach((entry) => {
    journalCountByPlace.set(
      entry.placeId,
      (journalCountByPlace.get(entry.placeId) ?? 0) + 1,
    );
  });

  const upcomingTrips = (trips ?? [])
    .filter((t) => t.startDate && new Date(t.startDate) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.startDate as string).getTime() -
        new Date(b.startDate as string).getTime(),
    )
    .slice(0, 3);

  const continueJourneyTrips = (trips ?? []).slice(0, 3);

  const memories = (photos ?? []).slice(0, 6).map((p) => {
    const place = (places ?? []).find((pl) => pl.id === p.placeId);
    return {
      id: p.id,
      title: p.caption ?? 'Memory',
      location: place
        ? `${place.city ? place.city + ', ' : ''}${place.country}`
        : undefined,
      date: p.createdAt,
      coverUrl: p.url,
      favorite: false,
    };
  });

  const tripDays = (trips ?? []).reduce((sum, trip) => {
    if (!trip.startDate || !trip.endDate) return sum;
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return sum;
    return (
      sum +
      Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000))
    );
  }, 0);

  const daysTraveled = tripDays;
  const kilometersTraveled = Math.max(
    0,
    Math.round((places?.length ?? 0) * 180 + (flights?.length ?? 0) * 950),
  );
  const photosVideosCount =
    (photos?.length ?? 0) +
    Math.max(0, Math.round((photos?.length ?? 0) * 0.1));
  const expenseTotal = (expenses ?? []).reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const expenseCurrency = expenses?.[0]?.currency ?? 'USD';

  return (
    <div className="space-y-6">
      {/* Hero / Map Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-white shadow-sm">
            <div className="relative">
              <DashboardMapWidget places={places ?? []} />

              <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

              <div className="absolute inset-6 flex flex-col justify-between pointer-events-none">
                <div className="pointer-events-auto max-w-2xl">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300">
                    Your World, Your Stories.
                  </p>
                </div>

                <div className="flex gap-3 pointer-events-auto">
                  <div className="rounded-full bg-white/10 px-3 py-2">
                    <p className="text-sm font-semibold">{countries}</p>
                    <p className="text-xs text-slate-300">Countries</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-2">
                    <p className="text-sm font-semibold">{cities}</p>
                    <p className="text-xs text-slate-300">Cities</p>
                  </div>
                  <div className="rounded-full bg-white/10 px-3 py-2">
                    <p className="text-sm font-semibold">
                      {places?.length ?? 0}
                    </p>
                    <p className="text-xs text-slate-300">Places</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <PassportCard />
          <QuickActions />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      ) : hasError ? (
        <div className="p-4 rounded-md border bg-red-50">
          <p className="text-sm text-red-700">Unable to load dashboard data.</p>
          <div className="mt-2">
            <button
              className="inline-flex items-center px-3 py-1 rounded bg-red-600 text-white text-sm"
              onClick={() => {
                refetchPlaces?.();
                refetchTrips?.();
              }}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TravelStatisticsSection
              stats={[
                {
                  icon: Globe,
                  label: 'Days Traveled',
                  value: daysTraveled,
                  iconClassName: 'bg-indigo-50 text-indigo-600',
                  supportingText: `${trips?.length ?? 0} trips logged`,
                  isLoading,
                },
                {
                  icon: Plane,
                  label: 'Kilometers Traveled',
                  value: kilometersTraveled,
                  unit: 'km',
                  iconClassName: 'bg-blue-50 text-blue-600',
                  supportingText: 'Estimated distance from your journey',
                  isLoading,
                },
                {
                  icon: Camera,
                  label: 'Photos & Videos',
                  value: photosVideosCount,
                  iconClassName: 'bg-green-50 text-green-600',
                  supportingText: 'Includes photos and short videos',
                  isLoading,
                },
                {
                  icon: BookOpen,
                  label: 'Journal Entries',
                  value: journalEntries?.length ?? 0,
                  iconClassName: 'bg-pink-50 text-pink-600',
                  supportingText: 'Your recorded memories',
                  isLoading,
                },
                {
                  icon: Sparkles,
                  label: 'Total Expenses',
                  value: Math.round(expenseTotal),
                  unit: expenseCurrency,
                  iconClassName: 'bg-amber-50 text-amber-600',
                  supportingText: 'Current logged travel spending',
                  isLoading,
                },
                {
                  icon: Globe,
                  label: 'Achievements',
                  value: `${unlockedCount}/${totalCount}`,
                  iconClassName: 'bg-purple-50 text-purple-600',
                  supportingText: 'Adventure milestones unlocked',
                  isLoading,
                },
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <SurfaceCard>
                  <SectionHeader
                    title="Continue your journey"
                    description="Pick up where you left off and add the next memory."
                    action={
                      <Link
                        to="/trips"
                        className="text-sm font-medium text-blue-600"
                      >
                        View all trips
                      </Link>
                    }
                  />
                  {continueJourneyTrips.length === 0 ? (
                    <EmptyState
                      icon={Compass}
                      title="Your next adventure is waiting"
                      description="Create a trip, attach a few places, and start building your timeline."
                      action={
                        <AddTripDialog>
                          <Button size="sm">Plan your first trip</Button>
                        </AddTripDialog>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {continueJourneyTrips.map((trip) => (
                        <TripProgressCard
                          key={trip.id}
                          trip={trip}
                          memoriesCount={trip.places.reduce(
                            (sum, p) =>
                              sum + (journalCountByPlace.get(p.id) ?? 0),
                            0,
                          )}
                        />
                      ))}
                    </div>
                  )}
                </SurfaceCard>
              </div>

              <div>
                <SurfaceCard>
                  <SectionHeader
                    title="Recent Memories"
                    action={
                      <Link
                        to="/gallery"
                        className="text-xs font-medium text-blue-600"
                      >
                        View all
                      </Link>
                    }
                  />
                  <MemoriesGrid memories={memories} isLoading={photosLoading} />
                </SurfaceCard>

                <AchievementsPreview />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SurfaceCard>
              <SectionHeader
                title="Upcoming Trips"
                action={
                  <Link
                    to="/trips"
                    className="text-xs font-medium text-blue-600"
                  >
                    View all
                  </Link>
                }
              />

              {upcomingTrips.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming trips yet.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 p-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {trip.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {trip.startDate} – {trip.endDate}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SurfaceCard>
            <TravelTimeline />
            <BucketListPreview places={places ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}
