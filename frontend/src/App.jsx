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
