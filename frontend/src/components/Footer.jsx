import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { label: 'Events', path: '/events' },
      { label: 'Categories', path: '/events?category=all' },
      { label: 'Venues', path: '/events' },
      { label: 'Pricing', path: '/events' }
    ],
    company: [
      { label: 'About Us', path: '#' },
      { label: 'Careers', path: '#' },
      { label: 'Press', path: '#' },
      { label: 'Blog', path: '#' }
    ],
    support: [
      { label: 'Help Center', path: '#' },
      { label: 'Contact Us', path: '#' },
      { label: 'FAQs', path: '#' },
      { label: 'Terms of Service', path: '#' }
    ],
    legal: [
      { label: 'Privacy Policy', path: '#' },
      { label: 'Cookie Policy', path: '#' },
      { label: 'Refund Policy', path: '#' }
    ]
  }

  return (
    <footer className="bg-secondary-900 text-secondary-300" role="contentinfo">
      <div className="container-main py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white" aria-label="EventFlow Home">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>EventFlow</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Discover and book amazing events. Your gateway to unforgettable experiences.
            </p>
          </div>

          <nav aria-label="Product links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Support links">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {currentYear} EventFlow. All rights reserved.
            </p>
            <nav aria-label="Legal links" className="flex flex-wrap items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link key={link.label} to={link.path} className="text-sm hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer