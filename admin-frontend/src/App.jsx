import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Suspense, lazy } from 'react';

// Lazy load admin pages for performance
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Movies = lazy(() => import('./pages/Movies'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Theatres = lazy(() => import('./pages/Theatres'));
const Showtimes = lazy(() => import('./pages/Showtimes'));
const UpcomingMovies = lazy(() => import('./pages/UpcomingMovies'));
const Users = lazy(() => import('./pages/Users'));

const ProtectedRoute = ({ children }) => {
    const { adminToken } = useSelector((state) => state.auth);
    return adminToken ? children : <Navigate to="/login" replace />;
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Toaster position="top-right" reverseOrder={false} toastOptions={{ className: 'box-panel bg-base-900 text-white font-medium border border-base-800' }} />

            <Routes>
                <Route path="/login" element={
                    <Suspense fallback={<div className="h-screen bg-base-950" />}>
                        <AdminLogin />
                    </Suspense>
                } />

                <Route path="/" element={
                    <ProtectedRoute>
                        <Suspense fallback={<div className="h-screen bg-base-950 flex items-center justify-center"><div className="w-8 h-8 rounded-sm border-4 border-t-primary-500 border-base-800 animate-spin" /></div>}>
                            <AdminLayout />
                        </Suspense>
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="movies" element={<Movies />} />
                    <Route path="bookings" element={<Bookings />} />
                    <Route path="theatres" element={<Theatres />} />
                    <Route path="showtimes" element={<Showtimes />} />
                    <Route path="upcoming-movies" element={<UpcomingMovies />} />
                    <Route path="users" element={<Users />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
