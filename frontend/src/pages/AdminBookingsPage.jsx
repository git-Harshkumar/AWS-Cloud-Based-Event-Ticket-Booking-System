import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { DataError, Icon } from "../components/DesignSystem";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    api
      .get(
        `/admin/bookings?page=${page}&limit=12${status ? `&status=${status}` : ""}`,
      )
      .then(({ data }) => {
        if (!active) return;
        const payload = data?.data || data;
        setBookings(Array.isArray(payload) ? payload : payload?.bookings || []);
        setPagination(
          data?.pagination ||
            payload?.pagination || { total: 0, totalPages: 1 },
        );
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, status, retry]);
  if (error)
    return (
      <DataError
        title="Bookings could not load."
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  return (
    <div className="space-y-7">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE PEOPLE BEHIND THE PLANS</span>
          <h1 className="text-3xl font-medium">All bookings</h1>
          <p className="text-secondary-500 text-sm mt-3">
            Track the current status of every reservation.
          </p>
        </div>
        <Icon name="ticket" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-secondary-500 text-sm">
          {loading ? "Loading bookings..." : `${pagination.total} bookings`}
        </p>
        <div className="flex items-center gap-3">
          <label
            htmlFor="booking-status"
            className="text-sm text-secondary-600"
          >
            Status
          </label>
          <select
            id="booking-status"
            className="input"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="card">
        <table className="w-full responsive-table">
          <thead>
            <tr>
              {[
                "Reference",
                "Guest",
                "Event",
                "Tickets",
                "Amount",
                "Status",
                "Booked",
              ].map((x) => (
                <th key={x}>{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center" role="status">
                  Getting the guest list ready...
                </td>
              </tr>
            ) : bookings.length ? (
              bookings.map((booking) => (
                <tr key={booking.id}>
                  <td
                    data-label="Reference"
                    className="font-mono text-xs break-all"
                  >
                    {booking.bookingReference}
                  </td>
                  <td data-label="Guest">
                    <b className="font-medium">{booking.user?.name}</b>
                    <small className="block text-secondary-500 mt-1 break-all">
                      {booking.user?.email}
                    </small>
                  </td>
                  <td data-label="Event">
                    <Link
                      to={`/events/${booking.event?.id}`}
                      className="text-primary-700"
                    >
                      {booking.event?.title}
                    </Link>
                  </td>
                  <td data-label="Tickets">{booking.quantity}</td>
                  <td data-label="Amount">
                    ${Number(booking.totalAmount).toFixed(2)}
                  </td>
                  <td data-label="Status">
                    <span
                      className={
                        booking.status === "CONFIRMED"
                          ? "badge-success"
                          : booking.status === "CANCELLED"
                            ? "badge-danger"
                            : "badge-warning"
                      }
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td data-label="Booked">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-secondary-500">
                  No bookings match this status.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <nav
          className="flex justify-center items-center gap-4"
          aria-label="Bookings pagination"
        >
          <button
            className="btn-secondary"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm text-secondary-500">
            {page} / {pagination.totalPages}
          </span>
          <button
            className="btn-secondary"
            disabled={page >= pagination.totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
