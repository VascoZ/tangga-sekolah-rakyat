import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { LogOut, ChevronLeft, Menu, X } from 'lucide-react'

/**
 * Shared shell for desktop-oriented /kepsek and /pengelola dashboards.
 * Replaces the sidebar markup that used to be copy-pasted (with a hand-set
 * "active" link) into every page, and adds a mobile drawer so the dashboards
 * are usable on a phone instead of just squeezing a 256px sidebar onto it.
 */
function SidebarShell({ navItems, roleLabel, orgLabel = 'Sekolah Rakyat', backTo, backLabel = 'Kembali ke Dashboard', children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const NavList = ({ onNavigate }) => (
    <nav className="flex-1 mt-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = location.pathname === item.to
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              active
                ? 'bg-sr-50 text-sr-700 border-l-4 border-sr-700 font-medium'
                : 'text-sr-500 hover:bg-sr-50 border-l-4 border-transparent'
            }`}
          >
            <Icon className="w-5 h-5" /> {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const Brand = () => (
    <div className="p-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-sr-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <div className="min-w-0">
          <div className="font-display font-bold text-sr-900 text-sm">TANGGA</div>
          <div className="text-xs text-sr-400 truncate">{orgLabel}</div>
        </div>
      </div>
    </div>
  )

  const AccountFooter = ({ onNavigate }) => (
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-sr-700 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-medium">{user?.nama?.charAt(0) || '?'}</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-sr-900 truncate">{user?.nama || roleLabel}</div>
          <div className="text-xs text-sr-400">{roleLabel}</div>
        </div>
      </div>
      <button
        onClick={() => { onNavigate?.(); handleLogout() }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white shadow-sm min-h-screen flex-col flex-shrink-0">
        <Brand />
        <NavList />
        <AccountFooter />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sr-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-display font-bold text-sr-900 text-sm">TANGGA</span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu"
          className="p-2 rounded-lg text-sr-700 hover:bg-sr-50"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-modal flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between p-2 border-b border-gray-100">
              <div className="pl-2"><Brand /></div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Tutup menu" className="p-2 mr-2 text-sr-500 hover:text-sr-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
            <AccountFooter onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-8 overflow-y-auto min-w-0">
        {backTo && (
          <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-sr-500 hover:text-sr-700 mb-4">
            <ChevronLeft className="w-4 h-4" /> {backLabel}
          </Link>
        )}
        {children}
      </main>
    </div>
  )
}

export default SidebarShell
