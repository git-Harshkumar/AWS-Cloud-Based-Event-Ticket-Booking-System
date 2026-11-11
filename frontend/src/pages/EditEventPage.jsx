import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import EventForm from './EventForm'

function EditEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`)
      setEvent(response.data)
    } catch (err) {
      toast.error('Event not found')
      navigate('/admin/events')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return <EventForm initialData={event} isEditing={true} />
}

export default EditEventPage