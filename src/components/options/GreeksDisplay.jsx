import { useState } from 'react'
import { Info } from 'lucide-react'
import { GREEKS_CONFIG } from '../../utils/constants'

function GreeksDisplay({ greeks, showIV = true, compact = false }) {
  const [hoveredGreek, setHoveredGreek] = useState(null)

  if (!greeks) return null

  const displayGreeks = GREEKS_CONFIG.filter(g => {
    if (g.key === 'iv' && !showIV) return false
    return greeks[g.key] !== undefined
  })

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs">
        {displayGreeks.slice(0, 4).map(({ key, symbol }) => (
          <div key={key} className="flex items-center gap-1">
            <span className="text-text-tertiary">{symbol}</span>
            <span className={getGreekColorClass(key, greeks[key])}>
              {formatGreekValue(key, greeks[key])}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-text-tertiary mb-3">
        <span className="font-medium uppercase tracking-wider">Greeks</span>
        <Info size={12} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {displayGreeks.map(({ key, symbol, name, description, range }) => {
          const value = greeks[key]
          const isHovered = hoveredGreek === key
          const normalizedValue = normalizeGreekValue(key, value, range)

          return (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setHoveredGreek(key)}
              onMouseLeave={() => setHoveredGreek(null)}
            >
              <div className={`
                p-3 rounded-lg bg-bg-tertiary/50 border border-glass-border
                transition-all duration-200
                ${isHovered ? 'border-accent-purple/50 bg-bg-tertiary' : ''}
              `}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-text-tertiary">{symbol}</span>
                    <span className="text-xs text-text-tertiary">{name}</span>
                  </div>
                  <span className={`text-sm font-mono font-semibold ${getGreekColorClass(key, value)}`}>
                    {formatGreekValue(key, value)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getGreekBarClass(key, value)}`}
                    style={{ width: `${Math.abs(normalizedValue) * 100}%` }}
                  />
                </div>
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute z-10 bottom-full left-0 mb-2 p-2 rounded-lg bg-bg-elevated border border-glass-border text-xs text-text-secondary max-w-[200px] animate-fade-in">
                  {description}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatGreekValue(key, value) {
  if (value === undefined || value === null) return '—'

  switch (key) {
    case 'delta':
      return (value > 0 ? '+' : '') + value.toFixed(2)
    case 'gamma':
      return value.toFixed(3)
    case 'theta':
      return value.toFixed(2)
    case 'vega':
      return value.toFixed(2)
    case 'iv':
      return value.toFixed(0) + '%'
    default:
      return value.toFixed(2)
  }
}

function getGreekColorClass(key, value) {
  if (value === undefined || value === null) return 'text-text-tertiary'

  switch (key) {
    case 'delta':
      return value >= 0 ? 'text-call' : 'text-put'
    case 'theta':
      return 'text-put' // Theta is always negative for long options
    case 'gamma':
    case 'vega':
      return 'text-accent-purple'
    case 'iv':
      return value > 100 ? 'text-accent-gold' : 'text-text-primary'
    default:
      return 'text-text-primary'
  }
}

function getGreekBarClass(key, value) {
  switch (key) {
    case 'delta':
      return value >= 0 ? 'bg-call' : 'bg-put'
    case 'theta':
      return 'bg-put'
    case 'gamma':
    case 'vega':
      return 'bg-accent-purple'
    case 'iv':
      return value > 100 ? 'bg-accent-gold' : 'bg-accent-purple'
    default:
      return 'bg-accent-purple'
  }
}

function normalizeGreekValue(key, value, range) {
  if (!range || value === undefined) return 0

  const [min, max] = range
  const normalized = (value - min) / (max - min)
  return Math.max(0, Math.min(1, normalized))
}

export default GreeksDisplay
