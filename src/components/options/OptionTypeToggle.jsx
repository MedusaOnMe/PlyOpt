import { TrendingUp, TrendingDown } from 'lucide-react'
import { useOptions } from '../../context/OptionsContext'

function OptionTypeToggle({ className = '' }) {
  const { selectedType, selectType } = useOptions()

  return (
    <div className={`flex rounded-lg bg-bg-tertiary p-1 ${className}`}>
      <button
        onClick={() => selectType('CALL')}
        className={`
          flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md
          font-semibold text-sm transition-all duration-200
          ${selectedType === 'CALL'
            ? 'call-gradient text-bg-primary shadow-glow-call'
            : 'text-text-secondary hover:text-call hover:bg-call-surface'
          }
        `}
      >
        <TrendingUp size={18} />
        <span>CALL</span>
      </button>

      <button
        onClick={() => selectType('PUT')}
        className={`
          flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md
          font-semibold text-sm transition-all duration-200
          ${selectedType === 'PUT'
            ? 'put-gradient text-bg-primary shadow-glow-put'
            : 'text-text-secondary hover:text-put hover:bg-put-surface'
          }
        `}
      >
        <TrendingDown size={18} />
        <span>PUT</span>
      </button>
    </div>
  )
}

export default OptionTypeToggle
