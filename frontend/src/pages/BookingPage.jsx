import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

function BookingPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEvent()
  }, [eventId])

  const fetchEvent = async () => {
    try {
      console.log('Fetching event with id:', eventId)
      const response = await api.get(`/events/${eventId}`)
      console.log('Event response:', response.data)
      const eventData = response.data?.data || response.data
      setEvent(eventData)
    } catch (err) {
      console.error('Fetch event failed:', err)
      toast.error('Event not found')
      navigate('/events')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (quantity < 1) {
      setError('Please select at least 1 ticket')
      return
    }
    if (quantity > event.availableSeats) {
      setError(`Only ${event.availableSeats} tickets available`)
      return
    }
    if (quantity > 10) {
      setError('Maximum 10 tickets per booking')
      return
    }

    setBookingLoading(true)
    try {
      const response = await api.post('/bookings', {
        eventId,
        quantity
      })
      toast.success('Booking confirmed!')
      const data = response.data?.data || response.data
      const bookingId = data?.booking?.id || data?.id
      navigate(`/booking/confirmation/${bookingId}`)
    } catch (err) {
      const message = err.response?.data?.message || 'Booking failed. Please try again.'
      setError(message)
      toast.error(message)
    } finally {
      setBookingLoading(false)
    }
  }

  const totalAmount = event ? (event.ticketPrice * quantity).toFixed(2) : '0.00'

  if (loading) {
    return (
      <div className="container-main py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card animate-pulse p-8">
            <div className="h-8 bg-secondary-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-secondary-200 rounded"></div>
              <div className="h-12 bg-secondary-200 rounded"></div>
              <div className="h-12 bg-secondary-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container-main py-16 text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Event Not Found</h2>
        <p className="text-secondary-600 mb-6">Unable to load event details.</p>
        <Link to="/events" className="btn-primary">Browse Events</Link>
      </div>
    )
  }

  const isPastEvent = new Date(event.eventDate) < new Date()
  const isSoldOut = event.availableSeats <= 0

  return (
    <div className="container-main py-8">
      <div className="max-w-2xl mx-auto">
        <Link to={`/events/${eventId}`} className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-6">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Event
        </Link>

        <div className="card">
          <div className="p-6 border-b border-secondary-200">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className="badge-primary mb-2">{event.category}</span>
                <h2 className="text-xl font-bold text-secondary-900 mb-1">{event.title}</h2>
                <div className="flex items-center gap-4 text-sm text-secondary-600">
                  <span>
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {event.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Ticket Selection</h3>
              <div className="flex items-center gap-4">
                <label htmlFor="quantity" className="label mb-0">Number of Tickets</label>
                <div className="flex items-center border border-secondary-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || bookingLoading}
                    className="px-4 py-2 text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max={Math.min(10, event.availableSeats)}
                    className="w-20 text-center border-x border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    disabled={bookingLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, event.availableSeats, quantity + 1))}
                    disabled={quantity >= Math.min(10, event.availableSeats) || bookingLoading}
                    className="px-4 py-2 text-secondary-600 hover:bg-secondary-50 disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16M4 12h16" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-secondary-500">
                  (Max: {Math.min(10, event.availableSeats)} available)
                </span>
              </div>
            </div>

            <div className="bg-secondary-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">{quantity} × ${event.ticketPrice.toFixed(2)}</span>
                <span className="text-secondary-900 font-medium">${(event.ticketPrice * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-secondary-200 pt-3">
                <span className="text-secondary-600">Booking Fee</span>
                <span className="text-secondary-900 font-medium">$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-secondary-900 border-t border-secondary-200 pt-3">
                <span>Total</span>
                <span>${totalAmount}</span>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2" role="alert">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-secondary flex-1"
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 py-3"
                disabled={bookingLoading || isPastEvent || isSoldOut}
              >
                {bookingLoading ? 'Processing...' : `Confirm Booking - $${totalAmount}`}
              </button>
            </div>

            {(isPastEvent || isSoldOut) && (
              <p className="text-center text-sm text-secondary-500">
                {isPastEvent ? 'This event has already ended.' : 'This event is sold out.'}
              </p>
            )}
          </form>
        </div>

        <div className="mt-6 card p-6 bg-secondary-50">
          <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Booking Details
          </h4>
          <ul className="text-sm text-secondary-600 space-y-2">
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Unique booking reference generated</li>
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Instant confirmation via email</li>
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Mobile-friendly e-tickets</li>
            <li className="flex items-center gap-2"><svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Free cancellation up to 24h before event</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BookingPage