import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function MainLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export default MainLayout