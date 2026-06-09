import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { NotificationProvider } from './context/NotificationContext';
import SplashScreen from './pages/SplashScreen';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import VerifyOTP from './pages/VerifyOTP';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserPage from './pages/UserPage';
import FoodDetail from './pages/FoodDetail';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import Support from './pages/Support';
import Maintenance from './pages/Maintenance';

const MaintenanceWrapper = ({ children }) => {
  const { settings, loading } = useSettings();
  const { user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Allow admins to access everything, especially the admin panel to turn off maintenance mode
  const isAdmin = user?.role === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin');

  if (settings.maintenanceMode && !isAdmin && !isAdminPath && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }

  // If NOT in maintenance mode, don't allow access to /maintenance page
  if (!settings.maintenanceMode && location.pathname === '/maintenance') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter>
              <MaintenanceWrapper>
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/user" element={<UserPage />} />
                  <Route path="/food/:id" element={<FoodDetail />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/maintenance" element={<Maintenance />} />
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </MaintenanceWrapper>
            </BrowserRouter>
          </CartProvider>
        </NotificationProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
