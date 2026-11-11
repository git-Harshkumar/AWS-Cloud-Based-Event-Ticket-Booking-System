import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar({ user, onLogout }) {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const navLinks = [
    { path: '/events', label: 'Events' },
    { path: '/infrastructure', label: 'Infrastructure' }
  ]

  const authLinks = user?.role === 'ADMIN'
    ? [
        { path: '/admin', label: 'Admin Dashboard' },
        { path: '/admin/events', label: 'Manage Events' }
      ]
    : isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/my-bookings', label: 'My Bookings' }
      ]
    : []

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-main" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600" aria-label="EventFlow Home">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>EventFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-secondary-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-secondary-600 hidden sm:block">
                  Hi, {user.name}
                </span>
                <button
                  onClick={onLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-secondary-600 hover:text-primary-600"
            aria-label="Toggle menu"
            aria-expanded="false"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar