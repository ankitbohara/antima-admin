import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdInbox, MdCardTravel, MdPhotoLibrary, MdStar, MdCheckCircle, MdFiberNew } from 'react-icons/md'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '@/services/api'
import { useAuth } from '@/context/AuthContext'

const statusBadge = (s) => ({
  new: 'badge-new', contacted: 'badge-contacted',
  confirmed: 'badge-confirmed', cancelled: 'badge-cancelled',
}[s] || 'badge-new')

export default function Dashboard() {
  const { admin } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Total Enquiries', value: stats.totalEnquiries, icon: <MdInbox size={22} />, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'New Enquiries', value: stats.newEnquiries, icon: <MdFiberNew size={22} />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Confirmed', value: stats.confirmedEnquiries, icon: <MdCheckCircle size={22} />, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Active Packages', value: stats.totalPackages, icon: <MdCardTravel size={22} />, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Gallery Photos', value: stats.totalGallery, icon: <MdPhotoLibrary size={22} />, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
    { label: 'Testimonials', value: stats.totalTestimonials, icon: <MdStar size={22} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  ] : []

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair text-white text-3xl font-bold">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {admin?.name}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening with your travel business today.</p>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 h-24 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value, icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`card p-5 border ${bg}`}
            >
              <div className={`${color} mb-3`}>{icon}</div>
              <div className="font-playfair text-white text-3xl font-black">{value}</div>
              <div className="text-slate-500 text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-semibold font-playfair text-lg">Recent Enquiries</h2>
            <Link to="/enquiries" className="text-amber-400 text-xs hover:text-amber-300 no-underline">View all →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : stats?.recentEnquiries?.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No enquiries yet</p>
          ) : (
            <div className="space-y-2">
              {stats?.recentEnquiries?.map((enq) => (
                <Link key={enq._id} to={`/enquiries/${enq._id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors no-underline group">
                  <div>
                    <div className="text-white text-sm font-medium group-hover:text-amber-400 transition-colors">{enq.name}</div>
                    <div className="text-slate-500 text-xs">{enq.package || 'General Enquiry'} · {enq.phone}</div>
                  </div>
                  <span className={statusBadge(enq.status)}>{enq.status}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-white font-semibold font-playfair text-lg mb-5">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: '/packages/new', label: '+ Add Package', color: 'bg-amber-500/15 border-amber-500/25 text-amber-400 hover:bg-amber-500/25' },
              { to: '/gallery', label: '+ Upload Photo', color: 'bg-blue-500/15 border-blue-500/25 text-blue-400 hover:bg-blue-500/25' },
              { to: '/testimonials/new', label: '+ Add Review', color: 'bg-green-500/15 border-green-500/25 text-green-400 hover:bg-green-500/25' },
              { to: '/enquiries', label: 'View Enquiries', color: 'bg-purple-500/15 border-purple-500/25 text-purple-400 hover:bg-purple-500/25' },
            ].map(({ to, label, color }) => (
              <Link key={to} to={to}
                className={`border rounded-xl p-4 text-sm font-semibold transition-all no-underline text-center ${color}`}>
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-5 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="text-amber-400 text-xs font-semibold mb-1">💡 Tip</div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Respond to new enquiries within 2 hours for best conversion rates.
              {stats?.newEnquiries > 0 && <span className="text-amber-400 font-semibold"> You have {stats.newEnquiries} new enquiry awaiting!</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
