import { Link } from 'react-router-dom'
import { BookOpen, Users, LayoutGrid, Sparkles } from 'lucide-react'

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-krem to-sr-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sr-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-display font-bold text-xl text-sr-900">TANGGA</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#cara-kerja" className="hidden sm:inline text-sr-700 hover:text-sr-900 font-medium">Cara Kerja</a>
            <Link to="/login" className="bg-sr-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-sr-900 transition-colors">
              Masuk
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sr-900 mb-6 animate-fadeIn">
            Setiap Anak Punya Anak Tangganya Sendiri
          </h1>
          <p className="text-xl text-sr-500 mb-8 max-w-2xl mx-auto animate-slideUp">
            TANGGA membantu guru menemukan titik pijak setiap siswa dan menyusun bahan ajar yang sesuai tingkat kemampuannya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp" style={{ animationDelay: '200ms' }}>
            <Link to="/login" className="bg-sr-700 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-sr-900 transition-colors">
              Mulai Sekarang
            </Link>
            <a href="#cara-kerja" className="border-2 border-sr-700 text-sr-700 px-8 py-3 rounded-lg font-medium text-lg hover:bg-sr-50 transition-colors">
              Pelajari Lebih Lanjut
            </a>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <blockquote className="text-center">
            <p className="text-xl md:text-2xl text-sr-700 italic mb-4">
              "Di Sekolah Rakyat ada siswa SMA yang belum bisa membaca. Guru tahu itu, tapi tidak punya alat untuk tahu persis di anak tangga mana setiap anak berdiri. TANGGA menjawabnya."
            </p>
            <cite className="text-sr-500">— Menteri Sosial</cite>
          </blockquote>
        </div>
      </section>

      {/* Features */}
      <section id="cara-kerja" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="font-display text-3xl font-bold text-sr-900 text-center mb-12">
          Bagaimana TANGGA Bekerja
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-card animate-slideUp" style={{ animationDelay: '0ms' }}>
            <div className="w-12 h-12 bg-tangga-3 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display text-xl font-semibold text-sr-900 mb-2">
              Asesmen Lisan 5-8 Menit
            </h3>
            <p className="text-sr-500">
              Guru memandu siswa menjawab lisan. Satu ketukan per jawaban. Sistem menempatkan siswa di anak tangga yang tepat.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card animate-slideUp" style={{ animationDelay: '100ms' }}>
            <div className="w-12 h-12 bg-tangga-5 rounded-lg flex items-center justify-center mb-4">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display text-xl font-semibold text-sr-900 mb-2">
              Pengelompokan Otomatis
            </h3>
            <p className="text-sr-500">
              Kelas terbagi berdasarkan kemampuan nyata, bukan jenjang. Guru tahu persis kelompok mana membutuhkan bahan tingkat apa.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card animate-slideUp" style={{ animationDelay: '200ms' }}>
            <div className="w-12 h-12 bg-tangga-6 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display text-xl font-semibold text-sr-900 mb-2">
              Bahan Ajar Berdiferensiasi
            </h3>
            <p className="text-sr-500">
              Satu tema, enam tingkat bahan. AI menghasilkan materi yang sesuai konteks lokal dalam hitungan detik.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-sr-700 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-4xl font-bold text-white mb-2">5.130</div>
              <div className="text-sr-300">Siswa Baru 2026</div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold text-white mb-2">5-8</div>
              <div className="text-sr-300">Menit per Asesmen</div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold text-white mb-2">6</div>
              <div className="text-sr-300">Tingkat Bahan</div>
            </div>
            <div>
              <div className="font-display text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-sr-300">Tanpa Labeling Negatif</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-raised p-8 md:p-12 text-center">
          <h2 className="font-display text-3xl font-bold text-sr-900 mb-4">
            Siap Memulai?
          </h2>
          <p className="text-sr-500 mb-8 max-w-xl mx-auto">
            Akses untuk Guru, Kepala Sekolah, dan Pengelola Program Sekolah Rakyat.
          </p>
          <Link to="/login" className="inline-block bg-sr-700 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-sr-900 transition-colors">
            Masuk ke Aplikasi
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sr-900 text-sr-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="mb-2">© 2026 TANGGA · LAN Datathon 2026</p>
          <p className="text-sm">Dibangun untuk Sekolah Rakyat</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing