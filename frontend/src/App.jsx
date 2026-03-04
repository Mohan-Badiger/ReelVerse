import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Navbar from './components/common/Navbar';
import Profile from './pages/Profile';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';

// Lazy load admin pages for performance
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminMovies = lazy(() => import('./pages/admin/AdminMovies'));
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

const ProtectedRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} toastOptions={{ className: 'box-panel bg-base-900 text-white font-medium border border-white/10' }} />

      <Routes>
        {/* Admin Routes - Completely separate authentication and UI */}
        <Route path="/admin/login" element={
          <Suspense fallback={<div className="h-screen bg-base-950" />}>
            <AdminLogin />
          </Suspense>
        } />

        <Route path="/admin" element={
          <Suspense fallback={<div className="h-screen bg-base-950 flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-primary-500 border-base-800 animate-spin" /></div>}>
            <AdminLayout />
          </Suspense>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* User Routes - Wrapped with standard Navbar and layout */}
        <Route path="/*" element={
          <div className="min-h-screen flex flex-col pt-16">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetails />} />
                <Route path="/checkout/:showId" element={<CheckoutPage />} />
                <Route path="/booking/success" element={<SuccessPage />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
