import { NavLink } from 'react-router-dom'
import { MdDashboard, MdCardTravel, MdInbox, MdPhotoLibrary, MdStar, MdLogout, MdSettings } from 'react-icons/md'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { path: '/dashboard', icon: <MdDashboard size={20} />, label: 'Dashboard' },
  { path: '/packages',  icon: <MdCardTravel size={20} />, label: 'Packages' },
  { path: '/enquiries', icon: <MdInbox size={20} />,      label: 'Enquiries' },
  { path: '/gallery',   icon: <MdPhotoLibrary size={20} />, label: 'Gallery' },
  { path: '/testimonials', icon: <MdStar size={20} />,    label: 'Testimonials' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { admin, logout } = useAuth()

  return (
    <aside className={`fixed left-0 top-0 h-full bg-navy border-r border-white/[0.07] z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07]">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center text-lg flex-shrink-0">✈</div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-playfair text-white font-bold text-sm leading-none">Travel with</div>
            <div className="font-playfair text-amber-400 font-black text-base leading-none">Antima</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all duration-200 no-underline
              ${isActive
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="flex-shrink-0">{icon}</span>
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: user + logout */}
      <div className="border-t border-white/[0.07] p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-white text-xs font-semibold truncate">{admin?.name}</div>
              <div className="text-slate-500 text-[10px] truncate">{admin?.email}</div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none ${collapsed ? 'justify-center' : ''}`}
        >
          <MdLogout size={18} />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  )
}
