import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdSearch, MdDelete, MdVisibility, MdPhone, MdWhatsapp } from 'react-icons/md'
import api from '@/services/api'
import toast from 'react-hot-toast'

const STATUS_TABS = ['all', 'new', 'contacted', 'confirmed', 'cancelled']

const statusClass = (s) => ({
  new: 'badge-new', contacted: 'badge-contacted',
  confirmed: 'badge-confirmed', cancelled: 'badge-cancelled',
}[s] || 'badge-new')

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null) // for detail modal

  const fetchEnquiries = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/admin/enquiries?status=${activeStatus}&limit=50`)
      setEnquiries(data.data)
    } catch { toast.error('Failed to load enquiries') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEnquiries() }, [activeStatus])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/enquiries/${id}`, { status })
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status } : e))
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }))
      toast.success('Status updated')
    } catch { toast.error('Failed to update') }
  }

  const deleteEnquiry = async (id) => {
    if (!confirm('Delete this enquiry?')) return
    try {
      await api.delete(`/admin/enquiries/${id}`)
      setEnquiries(prev => prev.filter(e => e._id !== id))
      if (selected?._id === id) setSelected(null)
      toast.success('Enquiry deleted')
    } catch { toast.error('Failed to delete') }
  }

  const saveNotes = async (id, notes) => {
    try {
      await api.put(`/admin/enquiries/${id}`, { notes })
      toast.success('Notes saved')
    } catch { toast.error('Failed to save notes') }
  }

  const filtered = enquiries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.phone.includes(search) ||
    (e.package || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-playfair text-white text-3xl font-bold">Enquiries</h1>
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone..."
            className="input pl-9 w-56"
          />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer border
              ${activeStatus === s ? 'bg-amber-500 text-white border-transparent' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Table */}
        <div className="lg:col-span-2 card overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No enquiries found</div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map((enq, i) => (
                <motion.div
                  key={enq._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-4 flex items-center gap-3 hover:bg-white/[0.02] cursor-pointer transition-colors ${selected?._id === enq._id ? 'bg-amber-500/5 border-l-2 border-amber-500' : ''}`}
                  onClick={() => setSelected(enq)}
                >
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                    {enq.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{enq.name}</div>
                    <div className="text-slate-500 text-xs truncate">{enq.package || 'General'} · {enq.phone}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={statusClass(enq.status)}>{enq.status}</span>
                    <button onClick={e => { e.stopPropagation(); deleteEnquiry(enq._id) }}
                      className="text-red-400/50 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-1">
                      <MdDelete size={15} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="card p-5">
          {!selected ? (
            <div className="text-center py-12 text-slate-600">
              <MdVisibility size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Click an enquiry to view details</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.07]">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 font-bold">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-semibold">{selected.name}</div>
                  <div className="text-slate-500 text-xs">{new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  ['Package', selected.package || '—'],
                  ['Phone', selected.phone],
                  ['Email', selected.email || '—'],
                  ['Travellers', selected.travelers || '—'],
                  ['Date', selected.date ? new Date(selected.date).toLocaleDateString('en-IN') : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-white font-medium text-right max-w-[60%] truncate">{v}</span>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div className="mb-5 p-3 bg-white/5 rounded-xl">
                  <div className="text-slate-400 text-xs mb-1">Message</div>
                  <p className="text-slate-300 text-sm leading-relaxed">{selected.message}</p>
                </div>
              )}

              {/* Status update */}
              <div className="mb-4">
                <label className="label">Update Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['new', 'contacted', 'confirmed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => updateStatus(selected._id, s)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer border
                        ${selected.status === s ? 'bg-amber-500 text-white border-transparent' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label className="label">Admin Notes</label>
                <textarea
                  defaultValue={selected.notes || ''}
                  rows={3}
                  className="input resize-none text-xs"
                  placeholder="Add private notes..."
                  onBlur={e => saveNotes(selected._id, e.target.value)}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a href={`tel:${selected.phone}`}
                  className="btn btn-ghost flex-1 justify-center text-xs no-underline">
                  <MdPhone size={14} /> Call
                </a>
                <a href={`https://wa.me/91${selected.phone.replace(/\D/g, '').slice(-10)}?text=Hi ${selected.name}, this is Antima from Travel with Antima regarding your enquiry!`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn btn-success flex-1 justify-center text-xs no-underline">
                  <MdWhatsapp size={14} /> WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
