import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotAuthorizedPage } from './pages/NotAuthorizedPage';
import { AdminRoute } from './routes/AdminRoute';
import { StatesPage } from './pages/admin/StatesPage';
import { StateDetailsPage } from './pages/admin/StateDetailsPage';

export default function App() {
  return (
    <>
      {/* Toast notifications across the administrative portal */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '13px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />

      <Routes>
        {/* Public Authentication & Error Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/not-authorized" element={<NotAuthorizedPage />} />
        <Route path="/403" element={<Navigate to="/not-authorized" replace />} />

        {/* Protected Admin Routes guarded by AdminRoute (<Outlet />) */}
        <Route element={<AdminRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/states" element={<StatesPage />} />
          <Route path="/admin/states/:stateCode" element={<StateDetailsPage />} />
          <Route path="/admin" element={<Navigate to="/admin/states" replace />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
