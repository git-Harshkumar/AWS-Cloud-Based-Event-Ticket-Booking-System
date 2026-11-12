import { DataError } from "../components/DesignSystem";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function UserDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    totalBookings: 0,
    totalSpent: 0,
    ticketsBooked: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadError(false);
    setLoading(true);
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        api.get("/bookings/my"),
        api.get("/events?limit=4"),
      ]);

      const bookings = Array.isArray(bookingsRes.data)
        ? bookingsRes.data
        : bookingsRes.data?.data || [];
      const upcoming = bookings.filter(
        (b) =>
          b.status === "CONFIRMED" && new Date(b.event?.eventDate) > new Date(),
      );

      setStats({
        upcomingEvents: upcoming.length,
        totalBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
        totalSpent: bookings
          .filter((b) => b.status === "CONFIRMED")
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        ticketsBooked: bookings
          .filter((b) => b.status === "CONFIRMED")
          .reduce((sum, b) => sum + (b.quantity || 0), 0),
      });

      setUpcomingBookings(upcoming.slice(0, 3));

      const rawEvents =
        eventsRes.data?.events ||
        (Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setRecentEvents(rawEvents.slice(0, 4));
    } catch (err) {
      setLoadError(true);
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loadError && !loading)
    return (
      <div className="container-main py-8">
        <DataError
          title="Your space could not load."
          onRetry={fetchDashboardData}
        />
      </div>
    );

  if (loading) {
    return (
      <div className="container-main py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2"></div>
                  <div className="h-10 bg-secondary-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="card p-6">
                <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-secondary-200 rounded"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-secondary-200 rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-main py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-secondary-600 mt-1">
            Here's an overview of your event activity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Upcoming Events</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {stats.upcomingEvents}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Total Bookings</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-sage-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Tickets Booked</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  {stats.ticketsBooked}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Booking value</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">
                  ${stats.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-peach-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-peach-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">
                Upcoming Events
              </h2>
              <Link
                to="/my-bookings"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-secondary-200">
              {upcomingBookings.length === 0 ? (
                <div className="p-6 text-center text-secondary-500">
                  <svg
                    className="mx-auto w-12 h-12 text-secondary-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p>No upcoming events booked</p>
                  <Link
                    to="/events"
                    className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
                  >
                    Browse Events
                  </Link>
                </div>
              ) : (
                upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/booking/confirmation/${booking.id}`}
                    className="p-4 flex items-center gap-4 hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-8 h-8 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">
                        {booking.event.title}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {formatDate(booking.event.eventDate)} •{" "}
                        {booking.event.location}
                      </p>
                    </div>
                    <span className="badge-success">
                      {booking.quantity} ticket{booking.quantity > 1 ? "s" : ""}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-secondary-900">
                Explore more events
              </h2>
              <Link
                to="/events"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-secondary-200">
              {recentEvents.length === 0 ? (
                <div className="p-6 text-center text-secondary-500">
                  No events available
                </div>
              ) : (
                recentEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="p-4 flex items-center gap-4 hover:bg-secondary-50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="badge-primary">
                        {event.category?.slice(0, 1)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-secondary-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-sm text-secondary-500">
                        {formatDate(event.eventDate)} • {event.location}
                      </p>
                    </div>
                    <span className="font-semibold text-primary-600">
                      ${event.ticketPrice.toFixed(2)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 card p-6 bg-secondary-50">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/events" className="btn-primary">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Discover Events
            </Link>
            <Link to="/my-bookings" className="btn-outline">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              My Bookings
            </Link>
            <Link to="/events?category=Music" className="btn-secondary">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
              Concerts
            </Link>
            <Link to="/events?category=Conference" className="btn-secondary">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              Conferences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboardPage;
