import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import EventCard from "../components/EventCard";
import { Icon } from "../components/DesignSystem";

function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const filters = {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    dateFrom: searchParams.get("dateFrom") || "",
    dateTo: searchParams.get("dateTo") || "",
  };

  const [formFilters, setFormFilters] = useState(filters);

  const categories = [
    "Music",
    "Conference",
    "Workshop",
    "Sports",
    "Theater",
    "Food & Drink",
    "Art",
    "Technology",
    "Business",
    "Other",
  ];

  useEffect(() => {
    setFormFilters(filters);
    fetchEvents();
  }, [searchParams]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", Math.max(1, Number(searchParams.get("page")) || 1));
      params.append("limit", pagination.limit);
      if (filters.search) params.append("search", filters.search);
      if (filters.category) params.append("category", filters.category);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);

      const response = await api.get(`/events?${params.toString()}`);
      const data = response.data?.data || response.data;
      const eventsList = Array.isArray(data) ? data : data?.events || [];
      setEvents(eventsList);
      const paginationInfo =
        response.data?.pagination || data?.pagination || response.data;
      if (paginationInfo) {
        setPagination((prev) => ({
          ...prev,
          page: Math.max(1, Number(searchParams.get("page")) || 1),
          total: paginationInfo.total || 0,
          totalPages: paginationInfo.totalPages || 0,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFormFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    Object.entries(formFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFormFilters({ search: "", category: "", dateFrom: "", dateTo: "" });
    setSearchParams({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set("page", newPage);
      setSearchParams(params);
      setPagination((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="container-main py-8">
      <div className="events-intro">
        <div>
          <span className="eyebrow">A DATE WITH SOMETHING GOOD</span>
          <h1>Find your kind of moment.</h1>
          <p>Big nights, new ideas, little discoveries. Make one yours.</p>
        </div>
        <span className="category-icon tone-lilac hidden sm:inline-grid">
          <Icon name="ticket" />
        </span>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary-900">Filters</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
                disabled={Object.values(formFilters).every((v) => !v)}
              >
                Clear all
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="search" className="label">
                  Search Events
                </label>
                <input
                  type="text"
                  id="search"
                  value={formFilters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="input"
                  placeholder="Search by name..."
                />
              </div>

              <div>
                <label htmlFor="category" className="label">
                  Category
                </label>
                <select
                  id="category"
                  value={formFilters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="input"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Date Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                  <div>
                    <label htmlFor="dateFrom" className="sr-only">
                      From
                    </label>
                    <input
                      type="date"
                      id="dateFrom"
                      value={formFilters.dateFrom}
                      onChange={(e) =>
                        handleFilterChange("dateFrom", e.target.value)
                      }
                      className="input"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <label htmlFor="dateTo" className="sr-only">
                      To
                    </label>
                    <input
                      type="date"
                      id="dateTo"
                      value={formFilters.dateTo}
                      onChange={(e) =>
                        handleFilterChange("dateTo", e.target.value)
                      }
                      className="input"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApplyFilters}
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="btn-secondary"
                  disabled={Object.values(formFilters).every((v) => !v)}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <p className="text-secondary-600">
              {pagination.total} event{pagination.total !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-video bg-secondary-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card p-12 text-center">
              <svg
                className="mx-auto w-12 h-12 text-secondary-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Failed to load events
              </h3>
              <p className="text-secondary-600 mb-4">{error}</p>
              <button onClick={fetchEvents} className="btn-primary">
                Retry
              </button>
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No events found
              </h3>
              <p className="text-secondary-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              <button onClick={handleClearFilters} className="btn-outline">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <nav
                  className="flex items-center justify-center gap-2"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
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
                          onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(pagination.page + 1)}
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
      </div>
    </div>
  );
}

export default EventsPage;
