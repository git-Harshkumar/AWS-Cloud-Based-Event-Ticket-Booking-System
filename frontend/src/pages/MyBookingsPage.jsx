import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

function MyBookingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/my')
      const data = response.data?.data || response.data
      setBookings(Array.isArray(data) ? data : [])
    } catch (err) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return
    }

    setCancellingId(bookingId)
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      toast.success('Booking cancelled successfully')
      setBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-success'
      case 'CANCELLED': return 'badge-danger'
      case 'PENDING': return 'badge-warning'
      default: return 'badge-secondary'
    }
  }

  const canCancel = (booking) => {
    const eventDate = new Date(booking.event.eventDate)
    const now = new Date()
    return booking.status === 'CONFIRMED' && eventDate > now
  }

  if (loading) {
    return (
      <div className="container-main py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-secondary-900">My Bookings</h1>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card animate-pulse p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-secondary-200 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-secondary-200 rounded w-1/2"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-main py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">My Bookings</h1>
          <Link to="/events" className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Browse Events
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="card p-12 text-center">
            <svg className="mx-auto w-16 h-16 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="text-xl font-semibold text-secondary-900 mb-2">No bookings yet</h2>
            <p className="text-secondary-600 mb-6">When you book tickets, they'll appear here</p>
            <Link to="/events" className="btn-primary">Discover Events</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const event = booking.event
              const isPastEvent = new Date(event.eventDate) < new Date()
              return (
                <div key={booking.id} className="card">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-10 h-10 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Link to={`/events/${event.id}`} className="font-semibold text-lg text-secondary-900 hover:text-primary-600 transition-colors">
                            {event.title}
                          </Link>
                          <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.eventDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {event.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                            </svg>
                            {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end gap-3 sm:flex-row">
                        <div className="text-right">
                          <p className="text-sm text-secondary-500">Total Paid</p>
                          <p className="font-bold text-lg text-secondary-900">${booking.totalAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            to={`/booking/confirmation/${booking.id}`}
                            className="btn-secondary text-sm"
                          >
                            View Details
                          </Link>
                          {canCancel(booking) && (
                            <button
                              onClick={() => handleCancel(booking.id)}
                              disabled={cancellingId === booking.id}
                              className="btn-danger text-sm"
                            >
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookingsPage