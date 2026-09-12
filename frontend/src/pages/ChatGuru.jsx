import { useState, useRef, useEffect } from 'react'
import { Send, BookOpen } from 'lucide-react'
import { chatApi } from '../lib/api'
import GuruShell from '../components/GuruShell'

const FALLBACK_SUGGESTED = [
  'Bagaimana mengajar anak yang belum kenal huruf di usia SMA?',
  'Siswa saya 3 minggu di tangga 2 tidak naik. Apa yang harus dilakukan?',
  'Metode bermain untuk belajar penjumlahan dasar',
  'Bagaimana mengelola kelas dengan 6 tingkat kemampuan berbeda?',
]

const FALLBACK_ANSWERS = {
  'stagnan': 'Jika siswa stagnan di suatu tangga selama 3+ minggu:\n\n1. Cek apakah ada hambatan spesifik (penglihatan, pendengaran, trauma)\n2. Ganti media pembelajaran — kartu, lagu, pasir kinetik\n3. Kurangi kelompok, beri pendampingan 1:1\n4. Kembali ke tingkat sebelumnya untuk memperkuat fondasi\n5. Buat rencana pendampingan individual via TANGGA',
  'huruf': 'Anak SMA yang belum mengenal huruf membutuhkan pendekatan yang tidak mengintimidasi:\n\n1. Gunakan huruf berpasangan gambar (A-ayam, B-buku)\n2. Ajak menyanyi lagu alfabet\n3. Tulis di pasir atau pasir kinetik\n4. Fokus pada kemajuan kecil, bukan perbandingan\n5. Materi relevan dengan minat mereka',
  'default': 'Berdasarkan panduan literasi dasar:\n\n1. Asesmen lisan untuk mengetahui titik pijak\n2. Kelompokkan berdasarkan kemampuan nyata\n3. Gunakan bahan ajar berdiferensiasi per tingkat\n4. Pantau pergerakan mingguan\n\nTanyakan pertanyaan lebih spesifik untuk jawaban yang lebih tepat.',
}

function getFallbackAnswer(q) {
  const lower = q.toLowerCase()
  if (lower.includes('stagnan') || lower.includes('tidak naik')) return FALLBACK_ANSWERS.stagnan
  if (lower.includes('huruf') || lower.includes('membaca')) return FALLBACK_ANSWERS.huruf
  return FALLBACK_ANSWERS.default
}

function ChatGuru() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Halo! Saya asisten TANGGA. Tanyakan tentang strategi mengajar, remedial, atau mengelola kelas multi-tingkat.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggested, setSuggested] = useState(FALLBACK_SUGGESTED)
  const bottomRef = useRef(null)

  useEffect(() => {
    chatApi.suggested().then(setSuggested).catch(() => {})
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const pertanyaan = text.trim()
    if (!pertanyaan || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: pertanyaan }])
    setLoading(true)

    try {
      const res = await chatApi.tanya(pertanyaan)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: res.jawaban,
        sumber: res.sumber,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: getFallbackAnswer(pertanyaan),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <GuruShell title="Asisten Guru" subtitle="Berdasarkan panduan literasi dasar dan praktik remedial" backTo="/guru">
      <div className="flex flex-col" style={{ minHeight: '60vh' }}>
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-sr-700 text-white'
                  : 'bg-white shadow-card text-sr-800'
              }`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                {msg.sumber?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-sr-400 mb-1 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Rujukan:
                    </p>
                    {msg.sumber.map((s, i) => (
                      <p key={i} className="text-xs text-sr-500">{s.judul}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-card rounded-xl px-4 py-3 text-sr-400 text-sm flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-sr-300 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-sr-300 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-sr-300 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </span>
                Menyusun jawaban...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="sticky bottom-20">
          <div className="flex gap-2 overflow-x-auto pb-3">
            {suggested.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 bg-white border border-sr-200 rounded-full text-xs text-sr-600 whitespace-nowrap hover:bg-sr-50 flex-shrink-0"
              >
                {q.length > 45 ? q.slice(0, 45) + '…' : q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
            className="flex gap-2 bg-white rounded-xl p-2 shadow-card"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              aria-label="Tulis pertanyaan"
              className="flex-1 px-4 py-3 rounded-lg outline-none text-sr-800"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Kirim pertanyaan"
              className="bg-sr-700 text-white px-4 py-3 rounded-lg hover:bg-sr-900 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </GuruShell>
  )
}

export default ChatGuru
