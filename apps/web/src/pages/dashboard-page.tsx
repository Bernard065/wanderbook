import { Link } from 'react-router';
import {
  Globe,
  MapPin,
  Mountain,
  Plane,
  Camera,
  BookOpen,
  Compass,
  Sparkles,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { DashboardMapWidget } from '@/components/dashboard/dashboard-map-widget';
import { TripProgressCard } from '@/components/dashboard/trip-progress-card';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { AddTripDialog } from '@/components/add-trip-dialog';
import { AddJournalEntryDialog } from '@/components/add-journal-entry-dialog';
import { useAuthStore } from '@/stores/auth-store';
import { usePlaces } from '@/hooks/use-places';
import { useTrips } from '@/hooks/use-trips';
import { useAllJournalEntries } from '@/hooks/use-journal-entries';
import { usePhotos } from '@/hooks/use-photos';
import { useFlights } from '@/hooks/use-flights';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: places, isLoading: placesLoading } = usePlaces();
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const { data: journalEntries } = useAllJournalEntries();
  const { data: photos } = usePhotos();
  const { data: flights } = useFlights();

  const isLoading = placesLoading || tripsLoading;

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
  const recentPhotos = (photos ?? []).slice(0, 4);

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">
              Your travel book
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Good morning, {firstName}! 👋
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Capture memories, keep your trips organized, and revisit the
              places that shaped your journey.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AddTripDialog>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                <Compass className="h-4 w-4" />
                New trip
              </Button>
            </AddTripDialog>
            <AddJournalEntryDialog>
              <Button
                variant="outline"
                size="sm"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
              >
                <Sparkles className="h-4 w-4" />
                Write memory
              </Button>
            </AddJournalEntryDialog>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                icon={Globe}
                label="Countries Visited"
                value={countries}
              />
              <StatCard
                icon={MapPin}
                label="Cities Explored"
                value={cities}
                iconClassName="bg-purple-50 text-purple-600"
              />
              <StatCard
                icon={Mountain}
                label="Places Visited"
                value={places?.length ?? 0}
                iconClassName="bg-teal-50 text-teal-600"
              />
              <StatCard
                icon={Plane}
                label="Flights Taken"
                value={flights?.length ?? 0}
                iconClassName="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={Camera}
                label="Photos Captured"
                value={photos?.length ?? 0}
                iconClassName="bg-green-50 text-green-600"
              />
              <StatCard
                icon={BookOpen}
                label="Journal Entries"
                value={journalEntries?.length ?? 0}
                iconClassName="bg-pink-50 text-pink-600"
              />
            </div>

            <DashboardMapWidget places={places ?? []} />

            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">
                    Continue your journey
                  </h2>
                  <p className="text-sm text-slate-500">
                    Pick up where you left off and add the next memory.
                  </p>
                </div>
                <Link to="/trips" className="text-sm text-blue-600 font-medium">
                  View all trips
                </Link>
              </div>
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
                        (sum, p) => sum + (journalCountByPlace.get(p.id) ?? 0),
                        0,
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Upcoming Trips</h3>
                <Link to="/trips" className="text-xs text-blue-600 font-medium">
                  View all
                </Link>
              </div>
              {upcomingTrips.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No upcoming trips yet. Add one when you’re ready to plan
                  ahead.
                </p>
              ) : (
                <div className="space-y-3">
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
            </div>

            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Recent Memories</h3>
                <Link
                  to="/gallery"
                  className="text-xs text-blue-600 font-medium"
                >
                  View all
                </Link>
              </div>
              {recentPhotos.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Your latest photos will appear here once you add them.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {recentPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={photo.caption ?? 'Photo'}
                      className="aspect-square w-full object-cover rounded-md"
                    />
                  ))}
                </div>
              )}
            </div>

            <AchievementsPreview />
          </div>
        </div>
      )}
    </div>
  );
}
