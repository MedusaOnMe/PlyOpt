import { useOptions } from '../../context/OptionsContext'
import { NEAR_EXPIRY_DAYS } from '../../utils/constants'

function ExpirationSelector() {
  const { expirations, selectedExpiration, selectExpiration } = useOptions()

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
      {expirations.map((exp) => {
        const isSelected = selectedExpiration?.date === exp.date
        const isNearExpiry = exp.daysToExpiry <= NEAR_EXPIRY_DAYS

        return (
          <button
            key={exp.date}
            onClick={() => selectExpiration(exp)}
            className={`
              relative px-2.5 py-1 rounded text-[11px] font-medium
              transition-all duration-200 shrink-0 whitespace-nowrap
              ${isSelected
                ? 'bg-accent-purple text-white'
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
              }
              ${isNearExpiry && !isSelected ? 'ring-1 ring-accent-gold/50' : ''}
            `}
          >
            {exp.label} <span className="opacity-60">({exp.daysToExpiry}d)</span>
          </button>
        )
      })}
    </div>
  )
}

export default ExpirationSelector
