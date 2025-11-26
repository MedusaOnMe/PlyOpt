import { useToast } from '../../context/ToastContext'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }) {
  const configs = {
    success: {
      icon: <CheckCircle className="w-5 h-5 text-profit" />,
      bg: 'bg-profit/10 border-profit/30',
      text: 'text-profit',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    error: {
      icon: <XCircle className="w-5 h-5 text-loss" />,
      bg: 'bg-loss/10 border-loss/30',
      text: 'text-loss',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-accent-gold" />,
      bg: 'bg-accent-gold/10 border-accent-gold/30',
      text: 'text-accent-gold',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    info: {
      icon: <Info className="w-5 h-5 text-accent-purple" />,
      bg: 'bg-accent-purple/10 border-accent-purple/30',
      text: 'text-accent-purple',
      glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    },
  }

  const config = configs[toast.type] || configs.info

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3
        border rounded-xl backdrop-blur-xl
        min-w-[300px] max-w-[400px]
        animate-slide-in-right
        ${config.bg} ${config.glow}
      `}
    >
      <div className="shrink-0">
        {config.icon}
      </div>
      <p className={`text-sm flex-1 font-medium ${config.text}`}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
      </button>
    </div>
  )
}
