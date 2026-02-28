import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MdMenu } from 'react-icons/md'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-dark/95 backdrop-blur border-b border-white/[0.07] px-6 py-3.5 flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-1"
          >
            <MdMenu size={22} />
          </button>
          <div className="text-slate-400 text-sm">
            Admin Panel · <span className="text-white font-medium">Travel with Antima</span>
          </div>
          <a
            href={import.meta.env.VITE_FRONTEND_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-amber-400 hover:text-amber-300 transition-colors no-underline"
          >
            View Live Site →
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#0f1a2e', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#f59e0b', secondary: '#0f1a2e' } },
        }}
      />
    </div>
  )
}
