import { useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Camera,
  Compass,
  Heart,
  MapPin,
  Pencil,
  Plane,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type TabKey = 'overview' | 'memories' | 'journal' | 'gallery' | 'trips';

type MockPlaceDetail = {
  id: string;
  name: string;
  country: string;
  region: string;
  city: string;
  location: string;
  category: string;
  visitCount: number;
  firstVisitDate: string;
  heroImage: string;
  description: string;
  notes: string;
  visitHistory: Array<{
    title: string;
    date: string;
    detail: string;
  }>;
  mapSummary: string;
  relatedMemories: Array<{
    title: string;
    snippet: string;
  }>;
  relatedTrips: Array<{
    title: string;
    date: string;
  }>;
};

const PLACE_DETAILS: Record<string, MockPlaceDetail> = {
  kyoto: {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    region: 'Kansai',
    city: 'Kyoto',
    location: 'Higashiyama district',
    category: 'Historic city',
    visitCount: 3,
    firstVisitDate: '2019-10-14',
    heroImage:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    description:
      'Kyoto blends temple gardens, quiet lanes, and long evenings spent following lantern-lit streets near the river.',
    notes:
      'Best explored early in the morning before the crowds arrive. The seasonal tea houses and hidden courtyards make the city feel constanty fresh.',
    visitHistory: [
      {
        title: 'Autumn temple walk',
        date: 'October 2019',
        detail:
          'Spent three days hopping between Kiyomizu-dera and the bamboo grove.',
      },
      {
        title: 'Spring return trip',
        date: 'April 2022',
        detail:
          'Returned for the sakura bloom and a slower pace around the old neighborhoods.',
      },
      {
        title: 'Winter weekend',
        date: 'January 2024',
        detail:
          'Stayed near the river and used the calm weather to photograph the temples at dawn.',
      },
    ],
    mapSummary:
      'The city stretches from the eastern temple quarter toward the river, with easy walks between gardens and cafés.',
    relatedMemories: [
      {
        title: 'Morning matcha ritual',
        snippet:
          'A tiny tea house near the main lanes still feels like a secret.',
      },
      {
        title: 'Lantern-lit alleyways',
        snippet:
          'The evening walk through the old streets was the highlight of the trip.',
      },
    ],
    relatedTrips: [
      { title: 'Japan in Bloom', date: 'April 2022' },
      { title: 'Temple Trails', date: 'October 2019' },
    ],
  },
  santorini: {
    id: 'santorini',
    name: 'Santorini',
    country: 'Greece',
    region: 'Cyclades',
    city: 'Oia',
    location: 'Caldera rim',
    category: 'Island escape',
    visitCount: 2,
    firstVisitDate: '2021-07-02',
    heroImage:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    description:
      'The blue domes, sea views, and cliffside sunsets make Santorini feel cinematic even on ordinary days.',
    notes:
      'A perfect place to slow down with long lunches, short walks, and plenty of time for the evenings.',
    visitHistory: [
      {
        title: 'Sunset photography',
        date: 'July 2021',
        detail: 'Stayed in Oia and chased the light along the caldera path.',
      },
      {
        title: 'Late summer return',
        date: 'August 2023',
        detail:
          'Spent extra time on the beaches and in the small harbor cafés.',
      },
    ],
    mapSummary:
      'Most memorable stops are clustered around Oia, Fira, and the quieter villages along the caldera.',
    relatedMemories: [
      {
        title: 'Cliffside dinner',
        snippet:
          'The terrace meal with the sea breeze was worth the extra walk.',
      },
      {
        title: 'Blue dome sunrise',
        snippet: 'The quiet morning before the buses arrived was magical.',
      },
    ],
    relatedTrips: [
      { title: 'Aegean Summer', date: 'August 2023' },
      { title: 'Cyclades Escape', date: 'July 2021' },
    ],
  },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const place = placeId ? PLACE_DETAILS[placeId] : undefined;

  if (!place) {
    return (
      <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Place not found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          The place you are looking for does not exist or may have been removed.
        </p>
        <Link
          to="/places"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to places
        </Link>
      </div>
    );
  }

  const tabs: Array<{ key: TabKey; label: string; icon: typeof Compass }> = [
    { key: 'overview', label: 'Overview', icon: Compass },
    { key: 'memories', label: 'Memories', icon: Sparkles },
    { key: 'journal', label: 'Journal', icon: BookOpen },
    { key: 'gallery', label: 'Gallery', icon: Camera },
    { key: 'trips', label: 'Trips', icon: Plane },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/places"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to places
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            Favorite
          </Button>
          <Button variant="outline" size="sm" className="gap-2" disabled>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-72 sm:h-80">
          <img
            src={place.heroImage}
            alt={`View of ${place.name}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
                {place.category}
              </span>
              <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 backdrop-blur">
                {place.visitCount} visits
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {place.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-200">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {place.location}, {place.country}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                First visit {formatDate(place.firstVisitDate)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Place information
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">
                    About this stop
                  </h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {place.visitCount} visits
                </span>
              </div>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-sm font-medium text-slate-500">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {place.city}, {place.region}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-sm font-medium text-slate-500">
                    Country
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {place.country}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-sm font-medium text-slate-500">
                    First visit
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {formatDate(place.firstVisitDate)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <dt className="text-sm font-medium text-slate-500">
                    Category
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {place.category}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">Notes</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                What stands out
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {place.notes}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {place.description}
              </p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">Visit history</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Recent visits
              </h2>
              <div className="mt-5 space-y-4">
                {place.visitHistory.map((visit) => (
                  <div
                    key={visit.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {visit.title}
                      </h3>
                      <span className="text-sm text-slate-500">
                        {visit.date}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {visit.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">Map</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Area overview
              </h2>
              <div className="mt-4 flex h-48 items-center justify-center rounded-[1.25rem] border border-dashed border-slate-200 bg-linear-to-br from-slate-50 to-blue-50 text-center text-sm text-slate-600">
                <div>
                  <Compass className="mx-auto h-8 w-8 text-blue-500" />
                  <p className="mt-3 font-medium text-slate-800">
                    Map placeholder
                  </p>
                  <p className="mt-1">{place.mapSummary}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">
                Related memories
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Memories preview
              </h2>
              <div className="mt-5 space-y-3">
                {place.relatedMemories.map((memory) => (
                  <div
                    key={memory.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <h3 className="text-sm font-semibold text-slate-900">
                      {memory.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {memory.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-blue-600">Related trips</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Trips preview
              </h2>
              <div className="mt-5 space-y-3">
                {place.relatedTrips.map((trip) => (
                  <div
                    key={trip.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {trip.title}
                    </span>
                    <span className="text-sm text-slate-500">{trip.date}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            The {activeTab} view is coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
