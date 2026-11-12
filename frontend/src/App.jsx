import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import BookingPage from "./pages/BookingPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import UserDashboardPage from "./pages/UserDashboardPage";
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
import AdminBookingsPage from "./pages/AdminBookingsPage";
import ManageEventsPage from "./pages/ManageEventsPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import InfrastructurePage from "./pages/InfrastructurePage";
import NotFoundPage from "./pages/NotFoundPage";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/infrastructure" element={<InfrastructurePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/booking/:eventId" element={<BookingPage />} />
          <Route
            path="/booking/confirmation/:bookingId"
            element={<BookingConfirmationPage />}
          />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/events" element={<ManageEventsPage />} />
          <Route path="/admin/events/create" element={<CreateEventPage />} />
          <Route path="/admin/events/:id/edit" element={<EditEventPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="container-main py-16" role="status">
            Getting your space ready...
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </AuthProvider>
  );
}

export default App;
