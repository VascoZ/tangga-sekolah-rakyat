import { Link } from 'react-router-dom'
import { useAuthStore } from '../lib/auth'

function Placeholder({ title, back }) {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-card text-center max-w-md">
        <div className="text-4xl mb-4">🚧</div>
        <h1 className="font-display text-2xl font-bold text-sr-900 mb-2">{title}</h1>
        <p className="text-sr-500 mb-6">Fitur ini akan tersedia di versi selanjutnya.</p>
        <Link to={back} className="inline-block bg-sr-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-sr-900 transition-colors">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Placeholder