import { Link } from 'react-router';
import { Globe, MapPin, Building2, Luggage } from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { PlaceCard } from '@/components/place-card';
import { TripCard } from '@/components/trip-card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export function DashboardPage() {
  const { isLoading, countries, cities, placesCount, tripsCount, places, trips } =
    useDashboardStats();

  const topPlaces = places.slice(0, 4);
  const recentTrips = trips.slice(0, 3);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Your World, Your Stories.</h1>
      <p className="text-gray-500 mb-6">
        Capture every place, every moment, and relive them forever.
      </p>

      {isLoading ? (
        <p>Loading dashboard...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Globe} label="Countries" value={countries} />
            <StatCard
              icon={Building2}
              label="Cities"
              value={cities}
              iconClassName="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon={MapPin}
              label="Places"
              value={placesCount}
              iconClassName="bg-orange-50 text-orange-600"
            />
            <StatCard
              icon={Luggage}
              label="Trips"
              value={tripsCount}
              iconClassName="bg-green-50 text-green-600"
            />
          </div>

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">My Top Places</h2>
            <Link
              to="/places"
              className="text-sm text-blue-600 font-medium"
            >
              View All Places
            </Link>
          </div>

          {topPlaces.length === 0 ? (
            <p className="text-gray-500 mb-8">
              No places yet. Use "Add New" to add your first one.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {topPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Trips</h2>
            <Link to="/trips" className="text-sm text-blue-600 font-medium">
              View All Trips
            </Link>
          </div>

          {recentTrips.length === 0 ? (
            <p className="text-gray-500">
              No trips yet. Use "Add New" to plan your first one.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recentTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
