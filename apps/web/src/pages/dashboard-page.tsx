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
  const {
    data: journalEntries,
    isLoading: journalEntriesLoading,
    error: journalEntriesError,
    refetch: refetchJournalEntries,
  } = useAllJournalEntries();
  const {
    data: photos,
    isLoading: photosLoading,
    error: photosError,
    refetch: refetchPhotos,
  } = usePhotos();
  const {
    data: flights,
    isLoading: flightsLoading,
    error: flightsError,
    refetch: refetchFlights,
  } = useFlights();
  const {
    data: expenses,
    isLoading: expensesLoading,
    error: expensesError,
    refetch: refetchExpenses,
  } = useExpenses();
  const { unlockedCount: liveUnlockedCount, totalCount: liveTotalCount } =
    useAchievements();

  const resolvedPlaces = places ?? [];
  const resolvedTrips = trips ?? [];
  const resolvedJournalEntries = journalEntries ?? [];
  const resolvedPhotos = photos ?? [];
  const resolvedFlights = flights ?? [];
  const resolvedExpenses = expenses ?? [];

  const isLoading =
    placesLoading ||
    tripsLoading ||
    journalEntriesLoading ||
    photosLoading ||
    flightsLoading ||
    expensesLoading;
  const hasError = Boolean(
    placesError ||
    tripsError ||
    journalEntriesError ||
    photosError ||
    flightsError ||
    expensesError,
  );

  const countries = new Set(resolvedPlaces.map((p) => p.country)).size;
  const cities = new Set(
    resolvedPlaces.map((p) => p.city).filter((c): c is string => !!c),
  ).size;

  const journalCountByPlace = new Map<string, number>();
  resolvedJournalEntries.forEach((entry) => {
    journalCountByPlace.set(
      entry.placeId,
      (journalCountByPlace.get(entry.placeId) ?? 0) + 1,
    );
  });

  const upcomingTrips = resolvedTrips
    .filter((t) => t.startDate && new Date(t.startDate) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.startDate as string).getTime() -
        new Date(b.startDate as string).getTime(),
    )
    .slice(0, 3);

  const continueJourneyTrips = resolvedTrips.slice(0, 3);

  const memories = resolvedPhotos.slice(0, 6).map((p) => {
    const place = resolvedPlaces.find((pl) => pl.id === p.placeId);
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

  const tripDays = resolvedTrips.reduce((sum, trip) => {
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

  const unlockedCount = liveUnlockedCount;
  const totalCount = liveTotalCount;
  const daysTraveled = tripDays;
  const kilometersTraveled = Math.max(
    0,
    Math.round(resolvedPlaces.length * 180 + resolvedFlights.length * 950),
  );
  const photosVideosCount =
    resolvedPhotos.length +
    Math.max(0, Math.round(resolvedPhotos.length * 0.1));
  const expenseTotal = resolvedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const expenseCurrency = resolvedExpenses[0]?.currency;

  return (
    <div className="dashboard-shell space-y-6 pb-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-[30px] border border-sky-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(253,186,116,0.32),_transparent_18%),radial-gradient(circle_at_top_right,_rgba(45,212,191,0.28),_transparent_25%),linear-gradient(135deg,#0b1325_0%,#102f5d_35%,#193654_100%)] text-white shadow-[0_32px_90px_-40px_rgba(15,23,42,0.9)]">
            <div className="relative isolate">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.28),_transparent_22%)]" />
              <DashboardMapWidget places={resolvedPlaces} />

              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-950/25 via-slate-950/10 to-slate-950/35" />

              <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-7">
                <div className="pointer-events-auto max-w-xl">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.28em] text-sky-100/80">
                    Your World, Your Stories
                  </p>
                  <h1 className="text-3xl font-semibold tracking-[-0.06em] text-white md:text-4xl">
                    Travel smarter, remember deeper.
                  </h1>
                </div>

                <div className="pointer-events-auto flex flex-wrap gap-3">
                  <div className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white">
                      {countries}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/85">
                      Countries
                    </p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white">{cities}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/85">
                      Cities
                    </p>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-sm">
                    <p className="text-sm font-semibold text-white">
                      {resolvedPlaces.length}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-sky-100/85">
                      Places
                    </p>
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
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      ) : hasError ? (
        <div className="p-4 rounded-md border bg-red-50">
          <p className="text-sm text-red-700">Unable to load dashboard data.</p>
          <div className="mt-2">
            <button
              className="inline-flex items-center px-3 py-1 rounded bg-red-600 text-white text-sm"
              onClick={() => {
                refetchPlaces?.();
                refetchTrips?.();
                refetchJournalEntries?.();
                refetchPhotos?.();
                refetchFlights?.();
                refetchExpenses?.();
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
                  supportingText: `${resolvedTrips.length} trips logged`,
                  isLoading,
                },
                {
                  icon: Plane,
                  label: 'Kilometers Traveled',
                  value: kilometersTraveled,
                  unit: 'km',
                  iconClassName: 'bg-blue-50 text-primary',
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
                  value: resolvedJournalEntries.length,
                  iconClassName: 'bg-pink-50 text-pink-600',
                  supportingText: 'Your recorded memories',
                  isLoading,
                },
                {
                  icon: Sparkles,
                  label: 'Total Expenses',
                  value: Math.round(expenseTotal),
                  unit: expenseCurrency ?? '',
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
                        className="text-sm font-medium text-primary"
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
                        className="text-xs font-medium text-primary"
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
                    className="text-xs font-medium text-primary"
                  >
                    View all
                  </Link>
                }
              />

              {upcomingTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming trips yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {upcomingTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-100 p-2 transition-colors hover:bg-muted"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-slate-600">
                        <Compass className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {trip.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trip.startDate} – {trip.endDate}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </SurfaceCard>
            <TravelTimeline />
            <BucketListPreview places={resolvedPlaces} />
          </div>
        </div>
      )}
    </div>
  );
}
