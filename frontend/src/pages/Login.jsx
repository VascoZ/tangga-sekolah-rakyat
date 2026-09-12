import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'
import { useToast } from '../components/ToastProvider'
import { DEMO_AKUN } from '../lib/demoData'
import { GraduationCap, Building2, Users, Eye, EyeOff, AlertCircle, Wand2 } from 'lucide-react'

const PERAN_OPTIONS = [
  { key: 'guru', icon: GraduationCap, label: 'Guru' },
  { key: 'kepala_sekolah', icon: Building2, label: 'Kepsek' },
  { key: 'pengelola', icon: Users, label: 'Pengelola' },
]

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const toast = useToast()
  const [peran, setPeran] = useState('guru')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const peranKey = { guru: 'guru', kepala_sekolah: 'kepsek', pengelola: 'pengelola' }[peran]
  const akunDemo = DEMO_AKUN[peranKey]

  const isiOtomatis = () => {
    setUsername(akunDemo.username)
    setPassword(akunDemo.password)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const usernameFinal = username.trim() || akunDemo.username
    const passwordFinal = password || akunDemo.password

    if (usernameFinal !== akunDemo.username || passwordFinal !== akunDemo.password) {
      setError(`Username/password salah. Gunakan: ${akunDemo.username} / ${akunDemo.password}`)
      setLoading(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 400))

    const userData = {
      id: 1,
      nama: akunDemo.nama,
      peran,
      kelas: akunDemo.kelas,
    }

    login(userData, peran, 'demo-token')
    toast.success(`Selamat datang, ${akunDemo.nama}!`)

    if (peran === 'guru') navigate('/guru')
    else if (peran === 'kepala_sekolah') navigate('/kepsek')
    else navigate('/pengelola')

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-krem to-sr-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-raised p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sr-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">T</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-sr-900">Masuk ke TANGGA</h1>
          <p className="text-sr-500 mt-2">Pilih peran, lalu masuk dengan akun demo</p>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-slideUp">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-sr-700 mb-2">Pilih Peran</label>
            <div className="grid grid-cols-3 gap-2">
              {PERAN_OPTIONS.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setPeran(key); setError(null) }}
                  aria-pressed={peran === key}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    peran === key ? 'border-sr-700 bg-sr-50' : 'border-gray-200 hover:border-sr-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${peran === key ? 'text-sr-700' : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${peran === key ? 'text-sr-700' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-sr-700 mb-2">
              Username (Demo)
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={akunDemo.username}
              autoComplete="username"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label htmlFor="password" className="block text-sm font-medium text-sr-700 mb-2">
              Password (Demo)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={akunDemo.password}
                autoComplete="current-password"
                className="w-full px-4 py-3 pr-11 rounded-lg border border-gray-200 focus:border-sr-500 focus:ring-2 focus:ring-sr-200 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sr-400 hover:text-sr-700"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={isiOtomatis}
            className="w-full flex items-center justify-center gap-2 text-sm text-sr-700 hover:text-sr-900 mb-6 py-1"
          >
            <Wand2 className="w-4 h-4" /> Isi otomatis akun {PERAN_OPTIONS.find(p => p.key === peran)?.label}
          </button>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sr-700 text-white py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-sr-50 rounded-lg">
          <p className="text-sm font-medium text-sr-700 mb-2">Kredensial Demo:</p>
          <div className="space-y-1 text-xs text-sr-500">
            <p><strong>Guru:</strong> guru / guru123</p>
            <p><strong>Kepsek:</strong> kepsek / kepsek123</p>
            <p><strong>Pengelola:</strong> pengelola / pengelola123</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
