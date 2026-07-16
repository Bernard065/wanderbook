import { Routes, Route } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { DashboardPage } from '@/pages/dashboard-page';
import { PlacesPage } from '@/pages/places-page';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/places" element={<PlacesPage />} />
      </Route>
    </Routes>
  );
}

export default App;
