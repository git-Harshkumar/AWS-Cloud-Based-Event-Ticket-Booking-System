import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

function InfrastructurePage() {
  const [instanceData, setInstanceData] = useState(null)
  const [healthData, setHealthData] = useState(null)
  const [requestCounts, setRequestCounts] = useState({ 'backend-instance-1': 0, 'backend-instance-2': 0 })
  const [testResults, setTestResults] = useState([])
  const [isTesting, setIsTesting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInstanceInfo()
    fetchHealth()
  }, [])

  const fetchInstanceInfo = async () => {
    try {
      const response = await api.get('/instance')
      setInstanceData(response.data)
    } catch (error) {
      console.error('Failed to fetch instance info:', error)
    }
  }

  const fetchHealth = async () => {
    try {
      const response = await api.get('/health')
      setHealthData(response.data)
    } catch (error) {
      console.error('Failed to fetch health:', error)
    } finally {
      setLoading(false)
    }
  }

  const runLoadBalancingTest = async () => {
    setIsTesting(true)
    setTestResults([])
    const newCounts = { 'backend-instance-1': 0, 'backend-instance-2': 0 }
    const results = []

    for (let i = 0; i < 20; i++) {
      try {
        const response = await api.get('/instance')
        const instanceId = response.data.instanceId || 'unknown'
        newCounts[instanceId] = (newCounts[instanceId] || 0) + 1
        results.push({
          request: i + 1,
          instanceId,
          hostname: response.data.hostname,
          timestamp: new Date().toLocaleTimeString(),
          success: true
        })
      } catch (error) {
        results.push({
          request: i + 1,
          instanceId: 'error',
          hostname: 'N/A',
          timestamp: new Date().toLocaleTimeString(),
          success: false,
          error: error.message
        })
      }
      setTestResults([...results])
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setRequestCounts(newCounts)
    setIsTesting(false)
    toast.success('Load balancing test completed!')
  }

  const getDistributionPercentage = (instanceId) => {
    const total = requestCounts['backend-instance-1'] + requestCounts['backend-instance-2']
    if (total === 0) return 0
    return ((requestCounts[instanceId] || 0) / total * 100).toFixed(1)
  }

  return (
    <div className="container-main py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Infrastructure & Load Balancing Demo</h1>
        <p className="text-secondary-600">Demonstrating Application Load Balancer traffic distribution across two EC2 instances.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-600"></span>
            Current Request Handler
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary-600 border-t-transparent"></div>
            </div>
          ) : instanceData ? (
            <div className="space-y-3">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-600">Instance ID</span>
                  <span className="font-mono font-medium text-primary-700">{instanceData.instanceId}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-secondary-600">Hostname</span>
                  <span className="font-mono text-sm text-secondary-700">{instanceData.hostname}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-secondary-600">Message</span>
                  <span className="text-sm text-secondary-700">{instanceData.message}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-secondary-500">Unable to fetch instance data</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600"></span>
            Health Status
          </h3>
          {healthData ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Status</span>
                <span className={`badge ${healthData.status === 'healthy' ? 'badge-success' : 'badge-danger'}`}>
                  {healthData.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Uptime</span>
                <span className="font-mono text-sm text-secondary-700">{healthData.uptime ? `${Math.floor(healthData.uptime / 60)}m ${Math.floor(healthData.uptime % 60)}s` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Memory Usage</span>
                <span className="font-mono text-sm text-secondary-700">{healthData.memory ? `${Math.round(healthData.memory.heapUsed / 1024 / 1024)} MB` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Version</span>
                <span className="font-mono text-sm text-secondary-700">{healthData.version || 'N/A'}</span>
              </div>
            </div>
          ) : (
            <p className="text-secondary-500">Unable to fetch health data</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            Request Distribution
          </h3>
          <div className="space-y-4">
            {['backend-instance-1', 'backend-instance-2'].map((instanceId) => (
              <div key={instanceId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-secondary-700">{instanceId}</span>
                  <span className="text-sm text-secondary-600">{requestCounts[instanceId] || 0} requests ({getDistributionPercentage(instanceId)}%)</span>
                </div>
                <div className="h-3 bg-secondary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${getDistributionPercentage(instanceId)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <p className="text-xs text-secondary-500 text-center">
              Total requests: {requestCounts['backend-instance-1'] + requestCounts['backend-instance-2']}
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <div className="p-6 border-b border-secondary-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-semibold text-secondary-900">Load Balancing Test</h3>
          <button
            onClick={runLoadBalancingTest}
            disabled={isTesting}
            className="btn-primary"
          >
            {isTesting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Running test...
              </span>
            ) : (
              'Run 20 Requests Test'
            )}
          </button>
        </div>
        <div className="p-6">
          {testResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-secondary-500 border-b border-secondary-200">
                    <th className="pb-3 font-medium">Request #</th>
                    <th className="pb-3 font-medium">Instance ID</th>
                    <th className="pb-3 font-medium">Hostname</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result) => (
                    <tr key={result.request} className="border-b border-secondary-100">
                      <td className="py-2 font-mono">{result.request}</td>
                      <td className="py-2 font-mono text-primary-700">{result.instanceId}</td>
                      <td className="py-2 font-mono text-secondary-700">{result.hostname}</td>
                      <td className="py-2 text-secondary-600">{result.timestamp}</td>
                      <td className="py-2">
                        <span className={`badge ${result.success ? 'badge-success' : 'badge-danger'}`}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {testResults.length === 0 && !isTesting && (
            <p className="text-center text-secondary-500 py-8">Click "Run 20 Requests Test" to see load balancing in action</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="font-semibold text-secondary-900 mb-2">AWS Cloud Architecture & Services Used</h3>
          <p className="text-secondary-600">Breakdown of all Amazon Web Services powering the EventFlow platform</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="p-5 border border-secondary-200 rounded-xl bg-gradient-to-br from-orange-50/50 to-white hover:border-orange-200 transition-all">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl mb-4">
                ALB
              </div>
              <h4 className="font-bold text-secondary-900 text-base">AWS Application Load Balancer</h4>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Traffic Distribution & High Availability</p>
              <p className="text-sm text-secondary-600">
                Internet-facing Layer-7 load balancer distributing incoming API & checkout requests between multiple backend EC2 targets with active <span className="font-mono text-xs">/api/health</span> checks.
              </p>
            </div>

            <div className="p-5 border border-secondary-200 rounded-xl bg-gradient-to-br from-orange-50/50 to-white hover:border-orange-200 transition-all">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl mb-4">
                EC2
              </div>
              <h4 className="font-bold text-secondary-900 text-base">Amazon EC2</h4>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Backend Compute Instances</p>
              <p className="text-sm text-secondary-600">
                Scalable virtual compute servers running Node.js 20, Express REST API, and Prisma ORM managed by PM2 process manager across multiple Availability Zones.
              </p>
            </div>

            <div className="p-5 border border-secondary-200 rounded-xl bg-gradient-to-br from-green-50/50 to-white hover:border-green-200 transition-all">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl mb-4">
                S3
              </div>
              <h4 className="font-bold text-secondary-900 text-base">Amazon Simple Storage (S3)</h4>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Static Frontend & Asset Hosting</p>
              <p className="text-sm text-secondary-600">
                High-speed static website hosting for the React 18 production bundle (HTML, JS, CSS) and storage bucket for uploaded event promotional banners.
              </p>
            </div>

            <div className="p-5 border border-secondary-200 rounded-xl bg-gradient-to-br from-purple-50/50 to-white hover:border-purple-200 transition-all">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                RDS
              </div>
              <h4 className="font-bold text-secondary-900 text-base">Amazon RDS / PostgreSQL</h4>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">Relational Database Service</p>
              <p className="text-sm text-secondary-600">
                ACID-compliant relational database storing user accounts, events, seat capacities, and ticket bookings with serializable isolation transactions to prevent double-booking.
              </p>
            </div>

            <div className="p-5 border border-secondary-200 rounded-xl bg-gradient-to-br from-blue-50/50 to-white hover:border-blue-200 transition-all">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
                VPC
              </div>
              <h4 className="font-bold text-secondary-900 text-base">Amazon VPC & Subnets</h4>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Network Isolation & Security</p>
              <p className="text-sm text-secondary-600">
                Isolated virtual network with custom CIDR block (10.0.0.0/16), public subnets across 2 AZs, Route Tables, Internet Gateway, and security groups controlling port 80/5000/22 access.
              </p>
            </div>

            <div className="p-5 border border-secondary-200 rounded-xl bg-gradient-to-br from-pink-50/50 to-white hover:border-pink-200 transition-all">
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xl mb-4">
                CW
              </div>
              <h4 className="font-bold text-secondary-900 text-base">Amazon CloudWatch</h4>
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-2">Monitoring & Logging</p>
              <p className="text-sm text-secondary-600">
                System and application log aggregation via Winston logger, tracking EC2 CPU utilization, ALB target response latency, and error tracking.
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-secondary-200">
            <h4 className="text-center font-bold text-secondary-800 text-lg mb-6">Traffic & Request Flow Diagram</h4>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.932 5.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-6.932 2.072M15 12a3 3 0 11-6 0 3 3 0 016 0zM9.753 19.753a9 9 0 00-2.62 2.62M14.247 4.747a9 9 0 002.62 2.62" /></svg>
              </div>
              <p className="font-medium text-secondary-900">Internet Users (Web Browser)</p>
              <p className="text-xs text-secondary-500">React Frontend hosted on Amazon S3</p>
            </div>
            <div className="text-center text-secondary-400">
              <svg className="mx-auto w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="font-medium text-secondary-900">AWS Application Load Balancer (ALB)</p>
              <p className="text-sm text-secondary-500">Routes HTTP traffic on Port 80 / 443 across availability zones</p>
            </div>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                </div>
                <p className="font-medium text-secondary-900 text-sm">Amazon EC2 (AZ 1)</p>
                <p className="text-xs text-secondary-500">Node.js API • PM2 (Instance 1)</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
                </div>
                <p className="font-medium text-secondary-900 text-sm">Amazon EC2 (AZ 2)</p>
                <p className="text-xs text-secondary-500">Node.js API • PM2 (Instance 2)</p>
              </div>
            </div>
            <div className="text-center text-secondary-400">
              <svg className="mx-auto w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
              </div>
              <p className="font-medium text-secondary-900 text-sm">Amazon RDS / PostgreSQL Database</p>
              <p className="text-xs text-secondary-500">Prisma ORM • Connection Pooling • ACID Transactions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfrastructurePage