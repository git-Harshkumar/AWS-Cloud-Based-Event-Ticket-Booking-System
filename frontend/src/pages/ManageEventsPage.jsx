import { DataError } from "../components/DesignSystem";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, [pagination.page]);

  const fetchEvents = async () => {
    setLoadError(false);
    setLoading(true);
    setLoading(true);
    try {
      const response = await api.get(
        `/admin/events?page=${pagination.page}&limit=${pagination.limit}`,
      );
      const data = response.data?.data || response.data;
      const eventsList = Array.isArray(data) ? data : data?.events || [];
      setEvents(eventsList);
      const paginationInfo =
        response.data?.pagination || data?.pagination || response.data;
      if (paginationInfo) {
        setPagination((prev) => ({
          ...prev,
          total: paginationInfo.total || 0,
          totalPages: paginationInfo.totalPages || 0,
        }));
      }
    } catch (err) {
      setLoadError(true);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this event? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingId(eventId);
    try {
      await api.delete(`/events/${eventId}`);
      toast.success("Event deleted successfully");
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (event) => {
    const isPast = new Date(event.eventDate) < new Date();
    const isSoldOut = event.availableSeats <= 0;
    if (isPast) return "badge-secondary";
    if (isSoldOut) return "badge-danger";
    return "badge-success";
  };

  const getStatusText = (event) => {
    const isPast = new Date(event.eventDate) < new Date();
    const isSoldOut = event.availableSeats <= 0;
    if (isPast) return "Past";
    if (isSoldOut) return "Sold Out";
    return "Active";
  };

  if (loadError && !loading)
    return (
      <div className="container-main py-8">
        <DataError
          title="The event list could not load."
          onRetry={fetchEvents}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Manage Events
          </h1>
          <p className="text-secondary-600">
            View, edit, and manage all events
          </p>
        </div>
        <Link to="/admin/events/create" className="btn-primary">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Event
        </Link>
      </div>

      {loading ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full responsive-table">
              <thead>
                <tr className="text-left text-sm text-secondary-500 border-b border-secondary-200">
                  <th className="pb-3 font-medium">Event</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Location</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Seats</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr
                    key={i}
                    className="animate-pulse border-b border-secondary-100"
                  >
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                    </td>
                    <td className="py-4">
                      <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <svg
            className="mx-auto w-16 h-16 text-secondary-300 mb-4"
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
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">
            No events yet
          </h2>
          <p className="text-secondary-600 mb-6">
            Get started by creating your first event
          </p>
          <Link to="/admin/events/create" className="btn-primary">
            Create Event
          </Link>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full responsive-table">
                <thead>
                  <tr className="text-left text-sm text-secondary-500 border-b border-secondary-200">
                    <th className="pb-3 font-medium px-6">Event</th>
                    <th className="pb-3 font-medium px-6">Category</th>
                    <th className="pb-3 font-medium px-6">Date</th>
                    <th className="pb-3 font-medium px-6">Location</th>
                    <th className="pb-3 font-medium px-6">Price</th>
                    <th className="pb-3 font-medium px-6">Seats</th>
                    <th className="pb-3 font-medium px-6">Status</th>
                    <th className="pb-3 font-medium px-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-secondary-50">
                      <td data-label="Event" className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {event.imageUrl ? (
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
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
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-secondary-900 truncate max-w-xs">
                              {event.title}
                            </p>
                            <p className="text-sm text-secondary-500">
                              ID: {event.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Category" className="py-4 px-6">
                        <span className="badge-primary">{event.category}</span>
                      </td>
                      <td
                        data-label="Date"
                        className="py-4 px-6 text-secondary-900"
                      >
                        {formatDate(event.eventDate)}
                      </td>
                      <td
                        data-label="Location"
                        className="py-4 px-6 text-secondary-600"
                      >
                        {event.location}
                      </td>
                      <td
                        data-label="Price"
                        className="py-4 px-6 font-medium text-secondary-900"
                      >
                        ${event.ticketPrice.toFixed(2)}
                      </td>
                      <td
                        data-label="Seats"
                        className="py-4 px-6 text-secondary-900"
                      >
                        {event.availableSeats} / {event.totalSeats}
                      </td>
                      <td data-label="Status" className="py-4 px-6">
                        <span className={`badge ${getStatusBadge(event)}`}>
                          {getStatusText(event)}
                        </span>
                      </td>
                      <td data-label="Actions" className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="btn-ghost p-2"
                            title="Edit"
                            aria-label={`Edit ${event.title}`}
                          >
                            <svg
                              className="w-5 h-5 text-secondary-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                            aria-label={`Delete ${event.title}`}
                          >
                            {deletingId === event.id ? (
                              <svg
                                className="animate-spin w-5 h-5"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <nav
              className="flex items-center justify-center gap-2"
              aria-label="Pagination"
            >
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="btn-secondary px-3 py-2"
                aria-label="Previous page"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              {Array.from(
                { length: Math.min(pagination.totalPages, 5) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: pageNum }))
                      }
                      className={`w-10 h-10 rounded-lg text-sm font-medium ${
                        pageNum === pagination.page
                          ? "bg-primary-600 text-white"
                          : "text-secondary-600 hover:bg-secondary-100"
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={
                        pageNum === pagination.page ? "page" : undefined
                      }
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="btn-secondary px-3 py-2"
                aria-label="Next page"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default ManageEventsPage;
