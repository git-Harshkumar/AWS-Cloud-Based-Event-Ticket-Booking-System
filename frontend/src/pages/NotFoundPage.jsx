import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <span className="text-9xl font-bold text-primary-100">404</span>
        </div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-4">Page Not Found</h1>
        <p className="text-secondary-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/events" className="btn-outline">
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage