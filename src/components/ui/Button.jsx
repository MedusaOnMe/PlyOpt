export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  ...props
}) {
  const baseClasses = 'font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-accent-purple hover:bg-accent-purple/90 text-white hover:shadow-glow-purple',
    call: 'bg-call hover:bg-call-dark text-bg-primary hover:shadow-glow-call',
    put: 'bg-put hover:bg-put-dark text-bg-primary hover:shadow-glow-put',
    success: 'bg-profit hover:bg-profit/90 text-white',
    danger: 'bg-loss hover:bg-loss/90 text-white',
    warning: 'bg-accent-gold hover:bg-accent-gold/90 text-bg-primary',
    ghost: 'bg-transparent hover:bg-glass-hover text-text-secondary hover:text-text-primary',
    outline: 'bg-transparent border border-glass-border text-text-secondary hover:border-accent-purple hover:text-accent-purple',
  }

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
    xl: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}
