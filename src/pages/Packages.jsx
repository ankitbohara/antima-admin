import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { motion } from 'framer-motion'
import { MdAdd, MdEdit, MdDelete, MdToggleOn, MdToggleOff, MdStar, MdArrowBack } from 'react-icons/md'
import api from '@/services/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Heritage', 'Nature', 'Adventure', 'Beach', 'Offbeat', 'Pilgrimage']

// ── Package List ──────────────────────────────────────────────────────────────
export function PackageList() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPackages = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/packages')
      setPackages(data.data)
    } catch { toast.error('Failed to load packages') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchPackages() }, [])

  const toggleActive = async (pkg) => {
    try {
      await api.put(`/admin/packages/${pkg._id}`, { isActive: !pkg.isActive })
      setPackages(prev => prev.map(p => p._id === pkg._id ? { ...p, isActive: !p.isActive } : p))
      toast.success(`Package ${!pkg.isActive ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to update') }
  }

  const deletePackage = async (id) => {
    if (!confirm('Delete this package? This cannot be undone.')) return
    try {
      await api.delete(`/admin/packages/${id}`)
      setPackages(prev => prev.filter(p => p._id !== id))
      toast.success('Package deleted')
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-playfair text-white text-3xl font-bold">Packages</h1>
        <Link to="/packages/new" className="btn-primary no-underline"><MdAdd size={16} /> Add Package</Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse bg-white/5" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg, i) => (
            <motion.div key={pkg._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} className="card overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: pkg.tagColor }}>{pkg.tag}</span>
                  {pkg.isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">⭐ Featured</span>}
                </div>
                <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${pkg.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
              </div>
              <div className="p-4">
                <div className="text-white font-semibold mb-0.5">{pkg.name}</div>
                <div className="text-slate-500 text-xs mb-3">{pkg.location} · {pkg.duration}</div>
                <div className="flex items-center justify-between">
                  <div className="font-playfair text-amber-400 font-bold text-lg">{pkg.price}</div>
                  <div className="flex gap-1.5">
                    <button onClick={() => toggleActive(pkg)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none ${pkg.isActive ? 'text-green-400 hover:text-green-300' : 'text-slate-500 hover:text-white'}`}>
                      {pkg.isActive ? <MdToggleOn size={18} /> : <MdToggleOff size={18} />}
                    </button>
                    <Link to={`/packages/edit/${pkg._id}`}
                      className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors no-underline">
                      <MdEdit size={16} />
                    </Link>
                    <button onClick={() => deletePackage(pkg._id)}
                      className="p-1.5 rounded-lg text-red-400/50 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none">
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Package Form (Add / Edit) ─────────────────────────────────────────────────
export function PackageForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [imagePreview, setImagePreview] = useState(null)

  const { register, handleSubmit, control, reset, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      highlights: [''],
      includes: [''],
      excludes: [''],
      itinerary: [{ day: 'Day 1', title: '', desc: '' }],
    }
  })

  const { fields: highlights, append: addHighlight, remove: removeHighlight } = useFieldArray({ control, name: 'highlights' })
  const { fields: includes, append: addInclude, remove: removeInclude } = useFieldArray({ control, name: 'includes' })
  const { fields: excludes, append: addExclude, remove: removeExclude } = useFieldArray({ control, name: 'excludes' })
  const { fields: itinerary, append: addDay, remove: removeDay } = useFieldArray({ control, name: 'itinerary' })

  useEffect(() => {
    if (!isEdit) return
    api.get(`/admin/packages`).then(({ data }) => {
      const pkg = data.data.find(p => p._id === id)
      if (pkg) {
        reset({
          ...pkg,
          highlights: pkg.highlights.map(v => v) || [''],
          includes: pkg.includes.map(v => v) || [''],
          excludes: pkg.excludes.map(v => v) || [''],
        })
        setImagePreview(pkg.image)
      }
    }).finally(() => setLoading(false))
  }, [id])

  const onSubmit = async (values) => {
    try {
      const fd = new FormData()

      // Append simple fields
      const simpleFields = ['name', 'slug', 'location', 'duration', 'price', 'priceNumber', 'tag', 'tagColor', 'desc', 'category', 'isActive', 'isFeatured', 'order']
      simpleFields.forEach(f => { if (values[f] !== undefined) fd.append(f, values[f]) })

      // Arrays as JSON strings
      fd.append('highlights', JSON.stringify(values.highlights.filter(Boolean)))
      fd.append('includes', JSON.stringify(values.includes.filter(Boolean)))
      fd.append('excludes', JSON.stringify(values.excludes.filter(Boolean)))
      fd.append('itinerary', JSON.stringify(values.itinerary))

      // Image file
      if (values.imageFile?.[0]) fd.append('image', values.imageFile[0])

      if (isEdit) {
        await api.put(`/admin/packages/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Package updated!')
      } else {
        await api.post('/admin/packages', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Package created!')
      }
      navigate('/packages')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package')
    }
  }

  if (loading) return <div className="text-center py-20 text-slate-500">Loading...</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/packages')} className="btn-ghost p-2 cursor-pointer"><MdArrowBack size={18} /></button>
        <h1 className="font-playfair text-white text-2xl font-bold">{isEdit ? 'Edit Package' : 'Add New Package'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Package Name *</label>
              <input {...register('name', { required: true })} className="input" placeholder="e.g. Golden Triangle" />
            </div>
            <div>
              <label className="label">Location</label>
              <input {...register('location')} className="input" placeholder="Delhi · Agra · Jaipur" />
            </div>
            <div>
              <label className="label">Duration</label>
              <input {...register('duration')} className="input" placeholder="6 Days / 5 Nights" />
            </div>
            <div>
              <label className="label">Price (display)</label>
              <input {...register('price')} className="input" placeholder="₹18,500" />
            </div>
            <div>
              <label className="label">Price (number)</label>
              <input {...register('priceNumber', { valueAsNumber: true })} type="number" className="input" placeholder="18500" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category', { required: true })} className="input">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tag</label>
              <input {...register('tag')} className="input" placeholder="Best Seller" />
            </div>
          </div>
          <div className="mt-4">
            <label className="label">Description *</label>
            <textarea {...register('desc', { required: true })} rows={3} className="input resize-none" />
          </div>
          <div className="flex gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" {...register('isActive')} className="accent-amber-500" />
              Active (visible on website)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
              <input type="checkbox" {...register('isFeatured')} className="accent-amber-500" />
              Featured on homepage
            </label>
          </div>
        </div>

        {/* Image */}
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">Cover Image</h2>
          {imagePreview && <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded-xl mb-3" />}
          <input type="file" accept="image/*" {...register('imageFile')}
            onChange={e => { if (e.target.files[0]) setImagePreview(URL.createObjectURL(e.target.files[0])) }}
            className="input text-xs" />
          {isEdit && <p className="text-slate-500 text-xs mt-1.5">Leave empty to keep current image</p>}
          {!isEdit && (
            <div className="mt-3">
              <label className="label">Or paste image URL</label>
              <input {...register('image')} className="input" placeholder="https://images.unsplash.com/..." />
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Highlights</h2>
            <button type="button" onClick={() => addHighlight('')} className="btn-ghost text-xs"><MdAdd size={14} /> Add</button>
          </div>
          <div className="space-y-2">
            {highlights.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <input {...register(`highlights.${i}`)} className="input flex-1" placeholder={`Highlight ${i + 1}`} />
                <button type="button" onClick={() => removeHighlight(i)} className="btn-danger p-2 flex-shrink-0"><MdDelete size={14} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Includes / Excludes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-semibold text-sm">Includes</h2>
              <button type="button" onClick={() => addInclude('')} className="btn-ghost text-xs p-1.5"><MdAdd size={13} /></button>
            </div>
            <div className="space-y-2">
              {includes.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <input {...register(`includes.${i}`)} className="input flex-1 text-xs" placeholder="What's included" />
                  <button type="button" onClick={() => removeInclude(i)} className="text-red-400/50 hover:text-red-400 bg-transparent border-none cursor-pointer p-1"><MdDelete size={13} /></button>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-white font-semibold text-sm">Excludes</h2>
              <button type="button" onClick={() => addExclude('')} className="btn-ghost text-xs p-1.5"><MdAdd size={13} /></button>
            </div>
            <div className="space-y-2">
              {excludes.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <input {...register(`excludes.${i}`)} className="input flex-1 text-xs" placeholder="What's excluded" />
                  <button type="button" onClick={() => removeExclude(i)} className="text-red-400/50 hover:text-red-400 bg-transparent border-none cursor-pointer p-1"><MdDelete size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Itinerary</h2>
            <button type="button" onClick={() => addDay({ day: `Day ${itinerary.length + 1}`, title: '', desc: '' })}
              className="btn-ghost text-xs"><MdAdd size={14} /> Add Day</button>
          </div>
          <div className="space-y-4">
            {itinerary.map((f, i) => (
              <div key={f.id} className="bg-white/5 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <input {...register(`itinerary.${i}.day`)} className="input text-xs" placeholder="Day 1" />
                  <input {...register(`itinerary.${i}.title`)} className="input text-xs" placeholder="Day title" />
                </div>
                <div className="flex gap-2">
                  <textarea {...register(`itinerary.${i}.desc`)} rows={2} className="input flex-1 text-xs resize-none" placeholder="Day description..." />
                  <button type="button" onClick={() => removeDay(i)} className="text-red-400/50 hover:text-red-400 bg-transparent border-none cursor-pointer p-1 self-start mt-1"><MdDelete size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/packages')} className="btn-ghost">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center disabled:opacity-60">
            {isSubmitting
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : isEdit ? 'Save Changes' : 'Create Package'
            }
          </button>
        </div>
      </form>
    </div>
  )
}
