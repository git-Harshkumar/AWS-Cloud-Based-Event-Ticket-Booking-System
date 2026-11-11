import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

function BookingConfirmationPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`)
      const bookingData = response.data?.data || response.data
      setBooking(bookingData)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found')
      toast.error('Booking not found')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="container-main py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container-main py-16">
        <div className="max-w-md mx-auto text-center">
          <svg className="mx-auto w-16 h-16 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Booking Not Found</h1>
          <p className="text-secondary-600 mb-6">{error}</p>
          <Link to="/my-bookings" className="btn-primary">View My Bookings</Link>
        </div>
      </div>
    )
  }

  const event = booking.event
  const isPastEvent = new Date(event.eventDate) < new Date()

  return (
    <div className="container-main py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Booking Confirmed!</h1>
          <p className="text-secondary-600">Your tickets have been successfully booked</p>
        </div>

        <div className="card overflow-hidden mb-6">
          <div className="bg-primary-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Booking Reference</p>
                <p className="text-white font-mono text-xl font-bold tracking-wider">{booking.bookingReference}</p>
              </div>
              <span className={`badge ${getStatusBadge(booking.status)} bg-white/20 text-white border-white/30`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-lg mb-6" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <h2 className="text-2xl font-bold text-secondary-900 mb-2">{event.title}</h2>
            <span className="badge-primary mb-6 inline-block">{event.category}</span>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Date</p>
                  <p className="font-medium text-secondary-900">{formatDate(event.eventDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Time</p>
                  <p className="font-medium text-secondary-900">{formatTime(event.eventDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Location</p>
                  <p className="font-medium text-secondary-900">{event.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-secondary-500">Tickets</p>
                  <p className="font-medium text-secondary-900">{booking.quantity}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-secondary-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary-600">Total Paid</span>
                <span className="text-2xl font-bold text-secondary-900">${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-secondary-50 mb-6">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Important Information
          </h3>
          <ul className="text-sm text-secondary-600 space-y-2">
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Save your booking reference: <strong className="font-mono">{booking.bookingReference}</strong></li>
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>A confirmation email has been sent to your registered email address</li>
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Present your e-ticket (QR code) at the venue for entry</li>
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Free cancellation available up to 24 hours before the event</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/my-bookings" className="btn-primary w-full sm:w-auto">
            View My Bookings
          </Link>
          <Link to="/events" className="btn-outline w-full sm:w-auto">
            Browse More Events
          </Link>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmationPage