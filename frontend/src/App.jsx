import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AchievementHub from './pages/AchievementHub';
import Leaderboard from './pages/Leaderboard';
import MyAchievements from './pages/MyAchievements';
import VolunteerHub from './pages/VolunteerHub';
import PollutionDashboard from './components/PollutionDashboard';
import CreateReportPage from './pages/CreateReportPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

// ── Route Guards ────────────────────────────────────────────────────────────

/** Requires any logged-in user. */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

/** Requires admin role. */
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (!isAdmin()) return <Navigate to="/" replace />;
  return children;
};

/** Requires Cleanup_Task_Manager role. */
const CleanupRoute = ({ children }) => {
  const { isLoggedIn, isCleanupTaskManager, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn() || !isCleanupTaskManager()) return <Navigate to="/login" replace />;
  return children;
};

// ── Shared Layout (Navbar + page content) ───────────────────────────────────
const Layout = ({ children, hideFooter = false }) => (
  <>
    <Navbar />
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>{children}</div>
      {!hideFooter && <Footer />}
    </div>
  </>
);

// ── Login page guard: redirect already-logged-in users to their home ─────────
const LoginRoute = () => {
  const { isLoggedIn, isAdmin, isCleanupTaskManager, isVolunteer, loading } = useAuth();
  if (loading) return null;
  if (!isLoggedIn()) return <Login />;

  // Cleanup Task Managers go straight to the full-screen dashboard
  if (isCleanupTaskManager()) return <Navigate to="/dashboard" replace />;

  // Admins and Volunteers go to the Home/Landing page (they can visit dashboard via Nav)
  return <Navigate to="/" replace />;
};

// ── All Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  const { isLoggedIn, isCleanupTaskManager, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />

      {/* Volunteer-protected */}
      <Route path="/volunteers" element={
        <ProtectedRoute>
          <Layout><VolunteerHub /></Layout>
        </ProtectedRoute>
      } />

      {/* User-protected */}
      <Route path="/my-achievements" element={
        <ProtectedRoute>
          <Layout><MyAchievements /></Layout>
        </ProtectedRoute>
      } />

      {/* Admin-only */}
      <Route path="/achievements" element={
        <AdminRoute>
          <Layout><AchievementHub /></Layout>
        </AdminRoute>
      } />

      {/* Pollution Dashboard – Viewable by all logged-in users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {isCleanupTaskManager() ? (
            <div className="dark h-full w-full">
              <PollutionDashboard />
            </div>
          ) : (
            <Layout hideFooter={true}>
              <div className="dark h-screen w-full overflow-hidden">
                <PollutionDashboard hideHeader={true} />
              </div>
            </Layout>
          )}
        </ProtectedRoute>
      } />

      {/* Reports Dashboard (from ai-caption branch) */}
      <Route path="/reports-dashboard" element={
        <ProtectedRoute>
          <Layout><DashboardPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Report Routes */}
      <Route path="/reports/new" element={
        <ProtectedRoute>
          <Layout><CreateReportPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports/:id" element={
        <ProtectedRoute>
          <Layout><ReportDetailsPage /></Layout>
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={
        !isLoggedIn()
          ? <Navigate to="/login" replace />
          : isCleanupTaskManager()
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/" replace />
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
