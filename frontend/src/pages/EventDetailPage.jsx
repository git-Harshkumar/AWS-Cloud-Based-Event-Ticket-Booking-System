import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/events/${id}`)
      const eventData = response.data?.data || response.data
      setEvent(eventData)
    } catch (err) {
      setError(err.response?.data?.message || 'Event not found')
      toast.error('Event not found')
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to book tickets')
      navigate('/login')
      return
    }
    navigate(`/booking/${id}`)
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

  if (loading) {
    return (
      <div className="container-main py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card animate-pulse p-8">
            <div className="aspect-video bg-secondary-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-secondary-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-secondary-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-secondary-200 rounded"></div>
              <div className="h-4 bg-secondary-200 rounded"></div>
              <div className="h-4 bg-secondary-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container-main py-16">
        <div className="max-w-md mx-auto text-center">
          <svg className="mx-auto w-16 h-16 text-secondary-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Event Not Found</h1>
          <p className="text-secondary-600 mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <Link to="/events" className="btn-primary">Browse Events</Link>
        </div>
      </div>
    )
  }

  const isPastEvent = new Date(event.eventDate) < new Date()
  const isSoldOut = event.availableSeats <= 0

  return (
    <div className="container-main py-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-secondary-600 hover:text-primary-600 mb-6">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="card overflow-hidden">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={`${event.title} event`}
              className="w-full aspect-video object-cover"
            />
          ) : (
            <div className="w-full aspect-video bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              <svg className="w-24 h-24 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge-primary">{event.category}</span>
              {(isPastEvent || isSoldOut) && (
                <span className="badge-danger">{isPastEvent ? 'Past Event' : 'Sold Out'}</span>
              )}
              {!isPastEvent && !isSoldOut && (
                <span className="badge-success">{event.availableSeats} seats available</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">{event.title}</h1>

            <div className="grid sm:grid-cols-2 gap-6 mb-8 text-secondary-600">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">Date & Time</p>
                  <p>{formatDate(event.eventDate)} at {formatTime(event.eventDate)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900">Location</p>
                  <p>{event.location}</p>
                </div>
              </div>
            </div>

            <div className="prose prose-secondary max-w-none mb-8">
              <h2 className="text-lg font-semibold text-secondary-900 mb-3">Description</h2>
              <p className="text-secondary-600 whitespace-pre-line">{event.description}</p>
            </div>

            <div className="border-t border-secondary-200 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm text-secondary-500">Price per ticket</p>
                  <p className="text-3xl font-bold text-secondary-900">${event.ticketPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={handleBookNow}
                  disabled={isPastEvent || isSoldOut || bookingLoading}
                  className="btn-primary px-8 py-3 text-lg w-full sm:w-auto"
                >
                  {bookingLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : isPastEvent ? (
                    'Event Ended'
                  ) : isSoldOut ? (
                    'Sold Out'
                  ) : (
                    'Book Tickets'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage