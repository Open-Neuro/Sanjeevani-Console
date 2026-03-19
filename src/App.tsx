
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Products from './pages/Products';
import Overview from './pages/Overview';
import Orders from './pages/Orders';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import SignUp from './pages/SignUp';
import AIInsights from './pages/AIInsights';
import AuthCallback from './pages/AuthCallback';
import MainLayout from './components/MainLayout';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="font-sans antialiased text-gray-900 bg-[#f4f7f6] min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SignUp />} />
            <Route path="/login" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes inside MainLayout */}
            <Route path="/dashboard" element={<MainLayout />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="sales" element={<Sales />} />
              <Route path="customers" element={<Customers />} />
              <Route path="payments" element={<Payments />} />
              <Route path="ai-insights" element={<AIInsights />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
