
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import Overview from './pages/Overview';
import Orders from './pages/Orders';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import SignUp from './pages/SignUp';
import AIInsights from './pages/AIInsights';
import AuthCallback from './pages/AuthCallback';
import Onboarding from './pages/Onboarding';
import Plans from './pages/Plans';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './context/AuthContext';

import { useAuth } from './context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Protected Route Wrapper - Redirects to login if not authenticated
// Also handles onboarding redirect if profile is incomplete
const ProtectedRoute = () => {
  const { user, token, loading } = useAuth();
  
  if (loading) return null;
  
  if (!token || !user) return <Navigate to="/login" replace />;
  
  if (!user.pharmacy_name) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <Outlet />;
};

// Onboarding Route Wrapper - Only for logged in users WITHOUT a pharmacy profile
const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return null;
  
  if (!token || !user) return <Navigate to="/login" replace />;
  
  if (user.pharmacy_name) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Wrapper - Redirects to dashboard if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, token, loading } = useAuth();
  
  if (loading) return null;
  
  if (token && user) {
    if (user.pharmacy_name) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }
  
  return <>{children}</>;
};

// Token bridge: if backend redirects to "/?token=...", move internally to callback route.
const AuthTokenBridge = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const routeParams = new URLSearchParams(location.search);
  const browserParams = new URLSearchParams(window.location.search);
  const token = routeParams.get('token') || browserParams.get('token');

  if (token) {
    return <Navigate to={`/auth/callback?token=${encodeURIComponent(token)}`} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans antialiased text-gray-900 bg-[#f4f7f6] min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<AuthTokenBridge><PublicRoute><SignUp /></PublicRoute></AuthTokenBridge>} />
            <Route path="/login" element={<AuthTokenBridge><PublicRoute><SignUp /></PublicRoute></AuthTokenBridge>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Onboarding Route */}
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

            {/* Protected Routes inside MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<MainLayout />}>
                <Route index element={<Overview />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="sales" element={<Sales />} />
                <Route path="customers" element={<Customers />} />
                <Route path="payments" element={<Payments />} />
                <Route path="plans" element={<Plans />} />
                <Route path="ai-insights" element={<AIInsights />} />
              </Route>
            </Route>
            
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
