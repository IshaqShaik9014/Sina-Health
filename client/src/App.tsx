import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DoctorWorkstation } from './pages/doctor/DoctorWorkstation';
import { PharmacyConsole } from './pages/pharmacy/PharmacyConsole';
import { PatientPortal } from './pages/patient/PatientPortal';
import { ConsentCenter } from './pages/consent/ConsentCenter';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-clinical-bg text-clinical-text-secondary text-xs font-mono">
        Verifying clinical session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Clinical Workstation Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/doctor" element={<DoctorWorkstation />} />
            <Route path="/pharmacy" element={<PharmacyConsole />} />
            <Route path="/patient" element={<PatientPortal />} />
            <Route path="/consent" element={<ConsentCenter />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
