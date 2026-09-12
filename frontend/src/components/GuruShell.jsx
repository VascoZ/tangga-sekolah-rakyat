import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import {
  Home, ClipboardCheck, Users, LayoutGrid, BookOpen, MessageCircle,
  TrendingUp, LogOut, ChevronDown, ChevronLeft,
} from 'lucide-react'

const BOTTOM_NAV = [
  { to: '/guru', label: 'Beranda', icon: Home, match: (p) => p === '/guru' },
  { to: '/guru/asesmen', label: 'Asesmen', icon: ClipboardCheck, match: (p) => p.startsWith('/guru/asesmen') },
  { to: '/guru/siswa', label: 'Siswa', icon: Users, match: (p) => p.startsWith('/guru/siswa') },
  { to: '/guru/bahan', label: 'Bahan', icon: BookOpen, match: (p) => p.startsWith('/guru/bahan') },
  { to: '/guru/chat', label: 'Tanya', icon: MessageCircle, match: (p) => p.startsWith('/guru/chat') },
]

const MENU_LINKS = [
  { to: '/guru', label: 'Beranda', icon: Home },
  { to: '/guru/asesmen', label: 'Asesmen', icon: ClipboardCheck },
  { to: '/guru/siswa', label: 'Daftar Siswa', icon: Users },
  { to: '/guru/kelompok', label: 'Pengelompokan', icon: LayoutGrid },
  { to: '/guru/bahan', label: 'Bahan Ajar', icon: BookOpen },
  { to: '/guru/rencana', label: 'Rencana Pendampingan', icon: ClipboardCheck },
  { to: '/guru/pergerakan', label: 'Pergerakan Tangga', icon: TrendingUp },
  { to: '/guru/chat', label: 'Tanya Asisten', icon: MessageCircle },
]

/**
 * Shared shell for all /guru pages: consistent header (with back button or
 * greeting), a full nav menu under the avatar, and a bottom tab bar whose
 * active tab is derived from the current route instead of being hardcoded
 * per page.
 */
function GuruShell({ title, subtitle, backTo, greeting = false, right = null, children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-krem flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-start gap-3">
          <div className="min-w-0">
            {backTo && (
              <Link to={backTo} className="inline-flex items-center gap-1 text-sr-500 hover:text-sr-700 text-sm mb-1">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Link>
            )}
            {greeting && <p className="text-sr-500 text-sm">Selamat datang,</p>}
            <h1 className="font-display text-xl font-semibold text-sr-900 truncate">
              {greeting ? (user?.nama || 'Guru') : title}
            </h1>
            {subtitle && <p className="text-sr-500 text-sm truncate">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {right}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu akun"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sr-50 transition-colors"
              >
                <div className="w-9 h-9 bg-sr-700 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">{user?.nama?.charAt(0) || 'G'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-sr-400 hidden sm:block" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 bg-white rounded-xl shadow-modal border border-gray-100 py-2 min-w-[220px] z-50 animate-slideUp">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-medium text-sr-900 text-sm">{user?.nama || 'Guru'}</div>
                    <div className="text-xs text-sr-400">Wali Kelas · {user?.kelas?.nama || 'Kelas'}</div>
                  </div>
                  {MENU_LINKS.map((item) => {
                    const Icon = item.icon
                    const active = location.pathname === item.to
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-sr-50 ${active ? 'text-sr-900 font-medium bg-sr-50' : 'text-sr-700'}`}
                      >
                        <Icon className="w-4 h-4" /> {item.label}
                      </Link>
                    )
                  })}
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20" aria-label="Navigasi utama">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {BOTTOM_NAV.map((item) => {
              const active = item.match(location.pathname)
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${active ? 'text-sr-700' : 'text-sr-400 hover:text-sr-600'}`}
                >
                  <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5]' : ''}`} />
                  <span className={`text-xs ${active ? 'font-semibold' : ''}`}>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

export default GuruShell
