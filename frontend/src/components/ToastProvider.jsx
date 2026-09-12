import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

const ToastContext = createContext(null)

const STYLES = {
  success: { icon: CheckCircle2, bg: 'bg-green-600', ring: 'ring-green-100' },
  error: { icon: AlertTriangle, bg: 'bg-red-600', ring: 'ring-red-100' },
  info: { icon: Info, bg: 'bg-sr-700', ring: 'ring-sr-100' },
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback((type, message) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => remove(id), 3500)
    return id
  }, [remove])

  const api = useRef({
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  }).current

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const s = STYLES[t.type] || STYLES.info
          const Icon = s.icon
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 ${s.bg} text-white rounded-xl shadow-modal px-4 py-3 ring-4 ${s.ring} animate-slideUp`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed flex-1">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                aria-label="Tutup notifikasi"
                className="flex-shrink-0 opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast harus dipakai di dalam <ToastProvider>')
  return ctx
}

export { ToastProvider, useToast }
