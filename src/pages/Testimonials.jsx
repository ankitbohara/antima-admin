import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdStar, MdClose } from 'react-icons/md'
import api from '@/services/api'
import toast from 'react-hot-toast'

const COLORS = ['#f59e0b', '#8e44ad', '#e67e22', '#2980b9', '#16a085', '#e74c3c', '#27ae60']

function TestimonialModal({ testimonial, onClose, onSave }) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: testimonial || { rating: 5, color: '#f59e0b', isActive: true, isFeatured: false }
  })

  const onSubmit = async (values) => {
    try {
      if (testimonial?._id) {
        const { data } = await api.put(`/admin/testimonials/${testimonial._id}`, values)
        onSave(data.data, 'update')
        toast.success('Testimonial updated')
      } else {
        const { data } = await api.post('/admin/testimonials', values)
        onSave(data.data, 'create')
        toast.success('Testimonial added')
      }
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-white font-playfair font-bold text-xl">{testimonial?._id ? 'Edit' : 'Add'} Testimonial</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white bg-transparent border-none cursor-pointer"><MdClose size={20} /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Customer Name *</label>
              <input {...register('name', { required: true })} className="input" placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="label">City *</label>
              <input {...register('city', { required: true })} className="input" placeholder="Mumbai" />
            </div>
          </div>

          <div>
            <label className="label">Trip / Package *</label>
            <input {...register('trip', { required: true })} className="input" placeholder="Kerala Backwaters" />
          </div>

          <div>
            <label className="label">Rating</label>
            <select {...register('rating', { valueAsNumber: true })} className="input">
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''} {'★'.repeat(r)}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Review Text *</label>
            <textarea {...register('text', { required: true })} rows={4} className="input resize-none" placeholder="Customer's review..." />
          </div>

          <div>
            <label className="label">Avatar Color</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" {...register('color')} value={c} className="sr-only" />
                  <div className="w-8 h-8 rounded-full border-2 transition-all" style={{ backgroundColor: c, borderColor: watch('color') === c ? '#fff' : 'transparent' }} />
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" {...register('isActive')} className="accent-amber-500" /> Active
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" {...register('isFeatured')} className="accent-amber-500" /> Featured on homepage
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center disabled:opacity-60">
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'new' | testimonial obj

  const fetchTestimonials = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/testimonials')
      setTestimonials(data.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTestimonials() }, [])

  const handleSave = (t, type) => {
    if (type === 'create') setTestimonials(prev => [t, ...prev])
    else setTestimonials(prev => prev.map(x => x._id === t._id ? t : x))
  }

  const deleteTestimonial = async (id) => {
    if (!confirm('Delete this review?')) return
    try {
      await api.delete(`/admin/testimonials/${id}`)
      setTestimonials(prev => prev.filter(t => t._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const toggleFeatured = async (t) => {
    try {
      const { data } = await api.put(`/admin/testimonials/${t._id}`, { isFeatured: !t.isFeatured })
      setTestimonials(prev => prev.map(x => x._id === t._id ? data.data : x))
    } catch { toast.error('Failed to update') }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-playfair text-white text-3xl font-bold">Testimonials</h1>
        <button onClick={() => setModal('new')} className="btn-primary"><MdAdd size={16} /> Add Review</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-white/5" />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          No testimonials yet. <button onClick={() => setModal('new')} className="text-amber-400 bg-transparent border-none cursor-pointer">Add your first review →</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`card p-5 ${!t.isActive ? 'opacity-50' : ''}`}>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, s) => (
                  <MdStar key={s} size={14} className={s < t.rating ? 'text-yellow-400' : 'text-slate-600'} />
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">"{t.text}"</p>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: t.color }}>{t.avatar}</div>
                  <div>
                    <div className="text-white text-xs font-semibold">{t.name}</div>
                    <div className="text-slate-500 text-[10px]">{t.city} · {t.trip}</div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toggleFeatured(t)} title="Toggle featured"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none ${t.isFeatured ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}>
                    <MdStar size={15} />
                  </button>
                  <button onClick={() => setModal(t)}
                    className="p-1.5 rounded-lg text-blue-400/50 hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none">
                    <MdEdit size={15} />
                  </button>
                  <button onClick={() => deleteTestimonial(t._id)}
                    className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none">
                    <MdDelete size={15} />
                  </button>
                </div>
              </div>
              {t.isFeatured && <div className="mt-2 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full w-fit">⭐ Featured on homepage</div>}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <TestimonialModal
            testimonial={modal === 'new' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
