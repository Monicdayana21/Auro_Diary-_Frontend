import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import MoodTracker from './pages/MoodTracker';
import MoodBoard from './pages/MoodBoard';
import VisionBoard from './pages/VisionBoard';
import Quotes from './pages/Quotes';
import Memories from './pages/Memories';
import Capsules from './pages/Capsules';
import Dreams from './pages/Dreams';
import Settings from './pages/Settings';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  return !user ? children : <Navigate to="/dashboard" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="journal" element={<Journal />} />
        <Route path="mood" element={<MoodTracker />} />
        <Route path="mood-board" element={<MoodBoard />} />
        <Route path="vision-board" element={<VisionBoard />} />
        <Route path="quotes" element={<Quotes />} />
        <Route path="memories" element={<Memories />} />
        <Route path="capsules" element={<Capsules />} />
        <Route path="dreams" element={<Dreams />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000, style: { fontFamily: "'Outfit', sans-serif", borderRadius: '12px' } }} />
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
