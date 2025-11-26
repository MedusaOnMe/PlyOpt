import { useOptions } from '../../context/OptionsContext'
import { ChevronRight, Calendar, AlertTriangle } from 'lucide-react'
import { NEAR_EXPIRY_DAYS } from '../../utils/constants'

function ExpirationSelector() {
  const { expirations, selectedExpiration, selectExpiration } = useOptions()

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex items-center gap-1.5 text-text-tertiary text-xs mr-2 shrink-0">
        <Calendar size={14} />
        <span>Expiry</span>
      </div>

      <div className="flex gap-1">
        {expirations.map((exp) => {
          const isSelected = selectedExpiration?.date === exp.date
          const isNearExpiry = exp.daysToExpiry <= NEAR_EXPIRY_DAYS

          return (
            <button
              key={exp.date}
              onClick={() => selectExpiration(exp)}
              className={`
                relative px-3 py-2 rounded-lg text-sm font-medium
                transition-all duration-200 shrink-0
                ${isSelected
                  ? 'bg-accent-purple text-white shadow-glow-purple'
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                }
              `}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span className="whitespace-nowrap">{exp.label}</span>
                <span className={`
                  text-[10px] font-normal
                  ${isSelected ? 'text-white/70' : 'text-text-tertiary'}
                `}>
                  {exp.daysToExpiry} DTE
                </span>
              </div>

              {isNearExpiry && !isSelected && (
                <div className="absolute -top-1 -right-1">
                  <AlertTriangle size={12} className="text-accent-gold" />
                </div>
              )}

              {isSelected && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-purple" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ExpirationSelector
