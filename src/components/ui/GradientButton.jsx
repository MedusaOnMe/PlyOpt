import { forwardRef } from 'react'

const GradientButton = forwardRef(({
  children,
  variant = 'purple', // 'call', 'put', 'purple'
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  className = '',
  ...props
}, ref) => {
  const variants = {
    call: 'call-gradient text-bg-primary hover:shadow-glow-call',
    put: 'put-gradient text-bg-primary hover:shadow-glow-put',
    purple: 'purple-gradient text-white hover:shadow-glow-purple',
    outline: 'bg-transparent border border-accent-purple text-accent-purple hover:bg-accent-purple/10',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-glass-hover',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  }

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold
    rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:ring-offset-2 focus:ring-offset-bg-primary
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
  `

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          Processing...
        </>
      ) : children}
    </button>
  )
})

GradientButton.displayName = 'GradientButton'

export default GradientButton
