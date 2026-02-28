import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { MdCloudUpload, MdDelete, MdEdit, MdSave } from 'react-icons/md'
import api from '@/services/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Heritage', 'Nature', 'Adventure', 'Beach', 'Offbeat', 'Food', 'People']

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [newImageData, setNewImageData] = useState({ alt: '', category: 'Heritage' })
  const fileRef = useRef()

  const fetchImages = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/gallery')
      setImages(data.data)
    } catch { toast.error('Failed to load gallery') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchImages() }, [])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    let uploaded = 0

    for (const file of files) {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('alt', newImageData.alt || file.name.replace(/\.[^/.]+$/, ''))
      fd.append('category', newImageData.category)
      try {
        const { data } = await api.post('/admin/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        setImages(prev => [data.data, ...prev])
        uploaded++
      } catch { toast.error(`Failed to upload ${file.name}`) }
    }

    if (uploaded > 0) toast.success(`${uploaded} image(s) uploaded!`)
    setUploading(false)
    fileRef.current.value = ''
  }

  const saveEdit = async (id) => {
    try {
      const { data } = await api.put(`/admin/gallery/${id}`, editData)
      setImages(prev => prev.map(img => img._id === id ? data.data : img))
      setEditingId(null)
      toast.success('Updated')
    } catch { toast.error('Failed to update') }
  }

  const deleteImage = async (id) => {
    if (!confirm('Delete this photo?')) return
    try {
      await api.delete(`/admin/gallery/${id}`)
      setImages(prev => prev.filter(img => img._id !== id))
      toast.success('Photo deleted')
    } catch { toast.error('Failed to delete') }
  }

  const toggleActive = async (img) => {
    try {
      const { data } = await api.put(`/admin/gallery/${img._id}`, { isActive: !img.isActive })
      setImages(prev => prev.map(i => i._id === img._id ? data.data : i))
    } catch { toast.error('Failed to update') }
  }

  return (
    <div>
      <h1 className="font-playfair text-white text-3xl font-bold mb-6">Gallery</h1>

      {/* Upload Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Upload New Photos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="label">Default Alt Text</label>
            <input value={newImageData.alt} onChange={e => setNewImageData(p => ({ ...p, alt: e.target.value }))}
              className="input" placeholder="Travel photo description" />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={newImageData.category} onChange={e => setNewImageData(p => ({ ...p, category: e.target.value }))} className="input">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Select Images</label>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="input text-xs" />
          </div>
        </div>

        {/* Drop zone visual */}
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center cursor-pointer hover:border-amber-500/40 transition-colors"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-3 text-amber-400">
              <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
              Uploading to Cloudinary...
            </div>
          ) : (
            <>
              <MdCloudUpload size={36} className="text-slate-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Click to upload or drag & drop</p>
              <p className="text-slate-600 text-xs mt-1">JPG, PNG, WEBP up to 5MB each</p>
            </>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : images.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">No photos yet. Upload your first photo!</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.div key={img._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`card overflow-hidden group relative ${!img.isActive ? 'opacity-50' : ''}`}>
              <div className="aspect-square overflow-hidden">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>

              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">{img.category}</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditingId(img._id); setEditData({ alt: img.alt, category: img.category, isActive: img.isActive }) }}
                      className="w-7 h-7 bg-amber-500/80 rounded-lg flex items-center justify-center text-white cursor-pointer border-none hover:bg-amber-500">
                      <MdEdit size={13} />
                    </button>
                    <button onClick={() => deleteImage(img._id)}
                      className="w-7 h-7 bg-red-500/80 rounded-lg flex items-center justify-center text-white cursor-pointer border-none hover:bg-red-500">
                      <MdDelete size={13} />
                    </button>
                  </div>
                </div>
                <p className="text-white text-xs truncate">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingId(null)}>
          <div className="card p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-4">Edit Photo</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Alt Text</label>
                <input value={editData.alt} onChange={e => setEditData(p => ({ ...p, alt: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={editData.category} onChange={e => setEditData(p => ({ ...p, category: e.target.value }))} className="input">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-300">
                <input type="checkbox" checked={editData.isActive} onChange={e => setEditData(p => ({ ...p, isActive: e.target.checked }))} className="accent-amber-500" />
                Active (visible on website)
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditingId(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={() => saveEdit(editingId)} className="btn-primary flex-1 justify-center"><MdSave size={14} /> Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
