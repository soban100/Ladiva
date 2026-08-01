import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ScrollManager } from './components/ScrollManager';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const ProductListing = lazy(() => import('./pages/ProductListing').then(m => ({ default: m.ProductListing })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Category = lazy(() => import('./pages/Category').then(m => ({ default: m.default })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const OrderConfirmed = lazy(() => import('./pages/OrderConfirmed').then(m => ({ default: m.OrderConfirmed })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const SignIn = lazy(() => import('./pages/SignIn').then(m => ({ default: m.SignIn })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Orders = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));
const CategorySlugWithKey = lazy(() => import('./pages/CategorySlugWithKey').then(m => ({ default: m.default })));
const ContactUs = lazy(() => import('./pages/ContactUs').then(m => ({ default: m.ContactUs })));
const ShippingInfo = lazy(() => import('./pages/ShippingInfo').then(m => ({ default: m.ShippingInfo })));
const Returns = lazy(() => import('./pages/Returns').then(m => ({ default: m.Returns })));
const FAQ = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQ })));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminProducts })));
const AdminOrders = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminOrders })));
const AdminUsers = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminUsers })));
const AdminCategories = lazy(() => import('./pages/admin').then(m => ({ default: m.AdminCategories })));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
  </div>
);


function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
          <Router>
          <ScrollManager />
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<SignIn />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* User Routes */}
            <Route path="/" element={<UserLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={<ProductListing />} />
              <Route path="category" element={<Category />} />
              <Route path="category/:slug" element={<CategorySlugWithKey />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="order-confirmed" element={<ProtectedRoute><OrderConfirmed /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="contact-us" element={<ContactUs />} />
              <Route path="shipping-info" element={<ShippingInfo />} />
              <Route path="returns" element={<Returns />} />
              <Route path="faq" element={<FAQ />} />
            </Route>
            
            
            {/* Admin Routes - Admin Only (no ThemeProvider) */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </AuthProvider>
    </Provider>
  );
}

export default App;

