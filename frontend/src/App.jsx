import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Navbar from './components/common/Navbar';

const Profile = lazy(() => import('./pages/Profile'));
const Home = lazy(() => import('./pages/Home'));
const Movies = lazy(() => import('./pages/Movies'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const SuccessPage = lazy(() => import('./pages/SuccessPage'));
const Theatres = lazy(() => import('./pages/Theatres'));
const UpcomingMovies = lazy(() => import('./pages/UpcomingMovies'));


const ProtectedRoute = ({ children }) => {
    const { userInfo } = useSelector((state) => state.auth);
    return userInfo ? children : <Navigate to="/" />;
};

function App() {
    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} toastOptions={{ className: 'box-panel bg-base-900 text-white font-medium border border-base-800' }} />

            <Routes>

                {/* User Routes - Wrapped with standard Navbar and layout */}
                <Route path="/*" element={
                    <div className="min-h-screen flex flex-col pt-16">
                        <Navbar />
                        <main className="flex-grow">
                            <Suspense fallback={
                                <div className="h-[80vh] flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-sm border-4 border-t-primary-500 border-base-800 animate-spin" />
                                </div>
                            }>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/movies" element={<Movies />} />
                                    <Route path="/movie/:id" element={<MovieDetails />} />
                                    <Route path="/checkout/:showId" element={<CheckoutPage />} />
                                    <Route path="/booking/success" element={<SuccessPage />} />
                                    <Route path="/theatres" element={<Theatres />} />
                                    <Route path="/upcoming-movies" element={<UpcomingMovies />} />
                                    <Route
                                        path="/profile"
                                        element={
                                            <ProtectedRoute>
                                                <Profile />
                                            </ProtectedRoute>
                                        }
                                    />
                                </Routes>
                            </Suspense>
                        </main>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;
