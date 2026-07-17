import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { PlacesPage } from '@/pages/places-page';
import { PlaceDetailPage } from '@/pages/place-detail-page';
import { LoginPage } from '@/pages/login-page';
import { RegisterPage } from '@/pages/register-page';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/places" element={<PlacesPage />} />
        <Route path="/places/:id" element={<PlaceDetailPage />} />
      </Route>
    </Routes>
  );
}

export default App;
