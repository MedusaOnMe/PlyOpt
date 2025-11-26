import { forwardRef } from 'react'

const GlassCard = forwardRef(({
  children,
  className = '',
  elevated = false,
  hover = false,
  padding = true,
  rounded = 'xl',
  ...props
}, ref) => {
  const baseClasses = elevated ? 'glass-elevated' : 'glass-card'
  const hoverClasses = hover ? 'card-hover cursor-pointer' : ''
  const paddingClasses = padding ? 'p-4' : ''
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
  }[rounded] || 'rounded-xl'

  return (
    <div
      ref={ref}
      className={`
        ${baseClasses}
        ${roundedClasses}
        ${paddingClasses}
        ${hoverClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
})

GlassCard.displayName = 'GlassCard'

export default GlassCard
