import { useEffect } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 modal-backdrop"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className={`relative w-full ${sizes[size]} glass-elevated rounded-2xl shadow-glass-lg animate-scale-in`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-glass-border">
            <h2 className="text-lg font-semibold text-text-primary">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-glass-hover transition-colors text-text-tertiary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
