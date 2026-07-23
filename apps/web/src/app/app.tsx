import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { GuestRoute } from '@/components/auth/guest-route';
import { DashboardPage } from '@/pages/dashboard-page';
import { PlacesPage } from '@/pages/places-page';
import { PlaceDetailPage } from '@/pages/place-detail-page';
import { TripsPage } from '@/pages/trips-page';
import { TripDetailPage } from '@/pages/trip-detail-page';
import { SearchPage } from '@/pages/search-page';
import { BucketListPage } from '@/pages/bucket-list-page';
import { TimelinePage } from '@/pages/timeline-page';
import { LoginPage } from '@/pages/login-page';
import { RegisterPage } from '@/pages/register-page';

export function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bucket-list" element={<BucketListPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
