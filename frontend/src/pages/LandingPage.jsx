import { Link } from 'react-router-dom'

function LandingPage() {
  const stats = [
    { value: '10,000+', label: 'Events Hosted' },
    { value: '500,000+', label: 'Tickets Sold' },
    { value: '50,000+', label: 'Happy Customers' },
    { value: '200+', label: 'Cities Covered' }
  ]

  const features = [
    {
      icon: SearchIcon,
      title: 'Discover Events',
      description: 'Browse thousands of events across categories - concerts, conferences, workshops, sports, and more.'
    },
    {
      icon: TicketIcon,
      title: 'Easy Booking',
      description: 'Book tickets in seconds with our streamlined checkout process. Secure payments and instant confirmation.'
    },
    {
      icon: CalendarIcon,
      title: 'Manage Bookings',
      description: 'View all your bookings in one place. Cancel, transfer, or share tickets with ease.'
    },
    {
      icon: ShieldIcon,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with encrypted transactions and 99.9% uptime guarantee.'
    }
  ]

  const categories = [
    { name: 'Concerts', count: '1,200+', icon: MusicIcon },
    { name: 'Conferences', count: '800+', icon: PresentationIcon },
    { name: 'Workshops', count: '600+', icon: WrenchIcon },
    { name: 'Sports', count: '400+', icon: TrophyIcon },
    { name: 'Theater', count: '300+', icon: TheaterIcon },
    { name: 'Food & Drink', count: '200+', icon: UtensilsIcon }
  ]

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 to-white py-20 lg:py-32">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
              Discover & Book <span className="text-primary-600">Amazing Events</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-600 mb-10 max-w-2xl mx-auto">
              Your gateway to unforgettable experiences. From concerts to conferences, find and book tickets to the best events happening near you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/events" className="btn-primary px-8 py-3 text-base">
                Explore Events
              </Link>
              <Link to="/register" className="btn-outline px-8 py-3 text-base">
                Create Free Account
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="text-3xl sm:text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-sm text-secondary-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">Why Choose EventFlow?</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">Everything you need to discover, book, and manage event tickets seamlessly.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="card p-6">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-secondary-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-secondary-50">
        <div className="container-main">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">Popular Categories</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">Explore events across diverse categories tailored to your interests.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.name} to={`/events?category=${category.name.toLowerCase()}`} className="card p-6 flex items-center gap-4 group">
                <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <category.icon className="w-7 h-7 text-primary-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">{category.name}</h3>
                  <p className="text-sm text-secondary-500">{category.count} events</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/events" className="btn-outline px-8 py-3">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <div className="card overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 bg-primary-600 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Experience More?</h2>
                    <p className="text-primary-100 mb-8 max-w-sm mx-auto">Join thousands of event-goers who trust EventFlow for their ticketing needs. Create your free account today.</p>
                    <Link to="/register" className="btn bg-white text-primary-600 hover:bg-primary-50 px-8 py-3">
                      Get Started Free
                    </Link>
                  </div>
                </div>
                <div className="md:w-1/2 p-8 lg:p-12 flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                          <CheckIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-medium text-secondary-900">No Hidden Fees</h4>
                          <p className="text-sm text-secondary-600">Transparent pricing with no surprise charges</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <LockIcon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-medium text-secondary-900">Secure Transactions</h4>
                          <p className="text-sm text-secondary-600">Bank-level encryption for all payments</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <PhoneIcon className="w-5 h-5 text-purple-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-medium text-secondary-900">Mobile Tickets</h4>
                          <p className="text-sm text-secondary-600">Access tickets instantly on your phone</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-secondary-50 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <SupportIcon className="w-5 h-5 text-orange-600" aria-hidden="true" />
                        </div>
                        <div>
                          <h4 className="font-medium text-secondary-900">24/7 Support</h4>
                          <p className="text-sm text-secondary-600">Dedicated help whenever you need it</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function SearchIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
}
function TicketIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z" /></svg>
}
function CalendarIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
}
function ShieldIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
}
function MusicIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
}
function PresentationIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
}
function WrenchIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
}
function TrophyIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
}
function TheaterIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
}
function UtensilsIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 2v1h16V2M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2zM9 8v8M15 8v8" /></svg>
}
function CheckIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
}
function LockIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
}
function PhoneIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
}
function SupportIcon({ className }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
}

export default LandingPage