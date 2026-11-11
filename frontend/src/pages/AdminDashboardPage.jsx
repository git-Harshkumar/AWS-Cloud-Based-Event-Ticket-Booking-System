import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBookings: 0,
    totalTicketsSold: 0,
    totalRevenue: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, bookingsRes, chartRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/bookings?limit=5'),
        api.get('/admin/dashboard/charts')
      ])

      const statsData = statsRes.data?.data || statsRes.data || {}
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalEvents: statsData.totalEvents || 0,
        totalBookings: statsData.totalBookings || 0,
        totalTicketsSold: statsData.totalTicketsSold || 0,
        totalRevenue: statsData.totalRevenue || 0
      })

      const bookingsData = bookingsRes.data?.data || bookingsRes.data
      setRecentBookings(Array.isArray(bookingsData) ? bookingsData : (bookingsData?.bookings || []))

      const chartsData = chartRes.data?.data || chartRes.data
      setChartData(chartsData)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-secondary-200 rounded w-1/2 mb-2"></div>
              <div className="h-10 bg-secondary-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card p-6 h-96">
            <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-secondary-200 rounded"></div>
          </div>
          <div className="card p-6 h-96">
            <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-secondary-200 rounded"></div>
          </div>
        </div>
        <div className="card p-6">
          <div className="h-6 bg-secondary-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-secondary-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const revenueChartData = chartData?.revenueByMonth ? {
    labels: chartData.revenueByMonth.map(d => d.month),
    datasets: [{
      label: 'Revenue ($)',
      data: chartData.revenueByMonth.map(d => d.revenue),
      backgroundColor: 'rgba(14, 165, 233, 0.8)',
      borderColor: 'rgb(14, 165, 233)',
      borderWidth: 1,
      borderRadius: 6
    }]
  } : null

  const bookingsChartData = chartData?.bookingsByStatus ? {
    labels: chartData.bookingsByStatus.map(d => d.status),
    datasets: [{
      data: chartData.bookingsByStatus.map(d => d.count),
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
      borderWidth: 0
    }]
  } : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-600">Overview of platform metrics and activity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Users</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Events</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.totalEvents.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Bookings</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.totalBookings.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Tickets Sold</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">{stats.totalTicketsSold.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Revenue</p>
              <p className="text-3xl font-bold text-secondary-900 mt-1">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Revenue by Month</h3>
          <div className="h-80">
            {revenueChartData ? (
              <Bar
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-secondary-500">No data available</div>
            )}
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Bookings by Status</h3>
          <div className="h-80 flex items-center">
            {bookingsChartData ? (
              <Doughnut
                data={bookingsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } }
                }}
              />
            ) : (
              <div className="w-full flex items-center justify-center text-secondary-500">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-secondary-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">Recent Bookings</h3>
          <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-secondary-500 border-b border-secondary-200">
                <th className="pb-3 font-medium">Booking Ref</th>
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Tickets</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td className="py-8 text-center text-secondary-500" colSpan={7}>No recent bookings</td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-secondary-50">
                    <td className="py-4 font-mono text-sm text-primary-700">{booking.bookingReference}</td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-secondary-900">{booking.user.name}</p>
                        <p className="text-sm text-secondary-500">{booking.user.email}</p>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-secondary-900">{booking.event.title}</p>
                      <p className="text-sm text-secondary-500">{formatDate(booking.event.eventDate)}</p>
                    </td>
                    <td className="py-4 text-secondary-900">{booking.quantity}</td>
                    <td className="py-4 font-medium text-secondary-900">${booking.totalAmount.toFixed(2)}</td>
                    <td className="py-4">
                      <span className={`badge ${getStatusBadge(booking.status)}`}>{booking.status}</span>
                    </td>
                    <td className="py-4 text-sm text-secondary-600">{formatDate(booking.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage