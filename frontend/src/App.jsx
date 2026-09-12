import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/auth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import DashboardGuru from './pages/DashboardGuru'
import AsesmenMulai from './pages/AsesmenMulai'
import AsesmenBerlangsung from './pages/AsesmenBerlangsung'
import AsesmenHasil from './pages/AsesmenHasil'
import DaftarSiswa from './pages/DaftarSiswa'
import Pengelompokan from './pages/Pengelompokan'
import BahanAjar from './pages/BahanAjar'
import DashboardKepsek from './pages/DashboardKepsek'
import DashboardPengelola from './pages/DashboardPengelola'
import Placeholder from './pages/Placeholder'
import KepsekKelas from './pages/KepsekKelas'
import KepsekPrioritas from './pages/KepsekPrioritas'
import RencanaPendampingan from './pages/RencanaPendampingan'
import PengelolaAnalitik from './pages/PengelolaAnalitik'
import PengelolaPeta from './pages/PengelolaPeta'
import ChatGuru from './pages/ChatGuru'
import PergerakanTangga from './pages/PergerakanTangga'

function App() {
  const { user, peran } = useAuthStore()

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Guru routes */}
        <Route path="/guru" element={<ProtectedRoute peran="guru"><DashboardGuru /></ProtectedRoute>} />
        <Route path="/guru/asesmen" element={<ProtectedRoute peran="guru"><AsesmenMulai /></ProtectedRoute>} />
        <Route path="/guru/asesmen/sesi" element={<ProtectedRoute peran="guru"><AsesmenBerlangsung /></ProtectedRoute>} />
        <Route path="/guru/asesmen/hasil" element={<ProtectedRoute peran="guru"><AsesmenHasil /></ProtectedRoute>} />
        <Route path="/guru/siswa" element={<ProtectedRoute peran="guru"><DaftarSiswa /></ProtectedRoute>} />
        <Route path="/guru/kelompok" element={<ProtectedRoute peran="guru"><Pengelompokan /></ProtectedRoute>} />
        <Route path="/guru/bahan" element={<ProtectedRoute peran="guru"><BahanAjar /></ProtectedRoute>} />
        <Route path="/guru/rencana" element={<ProtectedRoute peran="guru"><RencanaPendampingan /></ProtectedRoute>} />
        <Route path="/guru/chat" element={<ProtectedRoute peran="guru"><ChatGuru /></ProtectedRoute>} />
        <Route path="/guru/pergerakan" element={<ProtectedRoute peran="guru"><PergerakanTangga /></ProtectedRoute>} />
        
        {/* Kepala Sekolah routes */}
        <Route path="/kepsek" element={<ProtectedRoute peran="kepala_sekolah"><DashboardKepsek /></ProtectedRoute>} />
        <Route path="/kepsek/kelas" element={<ProtectedRoute peran="kepala_sekolah"><KepsekKelas /></ProtectedRoute>} />
        <Route path="/kepsek/prioritas" element={<ProtectedRoute peran="kepala_sekolah"><KepsekPrioritas /></ProtectedRoute>} />
        
        {/* Pengelola routes */}
        <Route path="/pengelola" element={<ProtectedRoute peran="pengelola"><DashboardPengelola /></ProtectedRoute>} />
        <Route path="/pengelola/analitik" element={<ProtectedRoute peran="pengelola"><PengelolaAnalitik /></ProtectedRoute>} />
        <Route path="/pengelola/peta" element={<ProtectedRoute peran="pengelola"><PengelolaPeta /></ProtectedRoute>} />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

function ProtectedRoute({ children, peran }) {
  const { isAuthenticated, peran: userPeran } = useAuthStore()
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  
  if (peran && userPeran !== peran && userPeran !== 'pengelola') {
    return <Navigate to="/" replace />
  }
  
  return children
}

export default App