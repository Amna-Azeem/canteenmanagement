import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { initDatabase } from './services/db';

// Components & Pages
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LoginPage } from './pages/LoginPage';
import { CustomerOrderPage } from './pages/CustomerOrderPage';
import { CustomerTrackingPage } from './pages/CustomerTrackingPage';
import { CustomerHistoryPage } from './pages/CustomerHistoryPage';
import { KitchenQueuePage } from './pages/KitchenQueuePage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const getStyles = () => {
          switch (t.type) {
            case 'success':
              return 'bg-emerald-900/90 text-white border-emerald-600';
            case 'error':
              return 'bg-red-900/90 text-white border-red-600';
            case 'warning':
              return 'bg-amber-900/90 text-white border-amber-600';
            default:
              return 'bg-slate-900/90 text-white border-slate-700';
          }
        };

        const getIcon = () => {
          switch (t.type) {
            case 'success':
              return <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
            default:
              return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
          }
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-right duration-200 ${getStyles()}`}
          >
            <div className="mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold">{t.title}</h4>
              <p className="text-xs opacity-90 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// Root Redirect component based on logged-in role
const HomeRedirect: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  if (currentUser.role === 'customer') return <Navigate to="/menu" replace />;
  if (currentUser.role === 'staff') return <Navigate to="/kitchen" replace />;
  if (currentUser.role === 'manager') return <Navigate to="/manager" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;

  return <Navigate to="/menu" replace />;
};

// App Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1">{children}</main>
      <NotificationDrawer />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dynamic Root Redirection */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Customer Routes */}
              <Route
                path="/menu"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AppLayout>
                      <CustomerOrderPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/track"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AppLayout>
                      <CustomerTrackingPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <AppLayout>
                      <CustomerHistoryPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Kitchen Staff Route */}
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'manager', 'admin']}>
                    <AppLayout>
                      <KitchenQueuePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Canteen Manager Route */}
              <Route
                path="/manager"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <AppLayout>
                      <ManagerDashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Administrator Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AppLayout>
                      <AdminPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
