import { Link } from 'react-router';
import { Globe, MapPin, Mountain, Plane, Camera, BookOpen } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { DashboardMapWidget } from '@/components/dashboard/dashboard-map-widget';
import { TripProgressCard } from '@/components/dashboard/trip-progress-card';
import { AchievementsPreview } from '@/components/dashboard/achievements-preview';
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

  const countries = new Set(places?.map((p) => p.country)).size;
  const cities = new Set(
    places?.map((p) => p.city).filter((c): c is string => !!c),
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
    <div>
      <h1 className="text-3xl font-serif mb-1">
        Good morning, {firstName}! 👋
      </h1>
      <p className="text-gray-500 mb-6">Ready for your next adventure?</p>

      {isLoading ? (
        <p>Loading dashboard...</p>
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">
                  Continue your journey
                </h2>
                <Link
                  to="/trips"
                  className="text-sm text-blue-600 font-medium"
                >
                  View all trips
                </Link>
              </div>
              {continueJourneyTrips.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No trips yet. Use "Add New" to plan your first one.
                </p>
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
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Upcoming Trips</h3>
                <Link
                  to="/trips"
                  className="text-xs text-blue-600 font-medium"
                >
                  View all
                </Link>
              </div>
              {upcomingTrips.length === 0 ? (
                <p className="text-xs text-gray-400">No upcoming trips.</p>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      to={`/trips/${trip.id}`}
                      className="flex items-center gap-3"
                    >
                      <div className="h-10 w-10 rounded-md bg-gray-100 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {trip.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {trip.startDate} – {trip.endDate}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border rounded-lg p-4">
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
                <p className="text-xs text-gray-400">No photos yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {recentPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt=""
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
