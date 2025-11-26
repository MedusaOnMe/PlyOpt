import { useOptions } from '../../context/OptionsContext'

function OptionsChainRow({ data }) {
  const { selectedStrike, selectedType, selectStrike, selectType } = useOptions()

  const isSelected = selectedStrike === data.strike
  const isCallSelected = isSelected && selectedType === 'CALL'
  const isPutSelected = isSelected && selectedType === 'PUT'

  const handleCallClick = () => {
    selectStrike(data.strike)
    selectType('CALL')
  }

  const handlePutClick = () => {
    selectStrike(data.strike)
    selectType('PUT')
  }

  return (
    <div
      className={`
        grid grid-cols-[1fr_60px_1fr] gap-0 text-[11px]
        border-b border-glass-border/50 last:border-b-0
        ${data.isATM ? 'bg-accent-purple/5' : ''}
      `}
    >
      {/* CALLS (Left Side) */}
      <div
        onClick={handleCallClick}
        className={`
          grid grid-cols-4 gap-1 px-2 py-1.5 cursor-pointer
          transition-all duration-150
          ${data.isITM.call ? 'bg-call/5' : ''}
          ${isCallSelected
            ? 'bg-call/20 ring-1 ring-inset ring-call/40'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        <div className="text-text-tertiary text-right font-mono">
          {data.iv.toFixed(0)}%
        </div>
        <div className="text-call text-right font-mono font-medium">
          {data.call.bid.toFixed(2)}
        </div>
        <div className="text-call text-right font-mono font-medium">
          {data.call.ask.toFixed(2)}
        </div>
        <div className={`text-right font-mono ${data.call.delta > 0.5 ? 'text-call' : 'text-text-tertiary'}`}>
          {data.call.delta.toFixed(2)}
        </div>
      </div>

      {/* STRIKE (Center) */}
      <div
        className={`
          flex items-center justify-center px-1 py-1.5
          border-x border-glass-border
          ${data.isATM ? 'bg-accent-purple/20' : 'bg-bg-secondary/50'}
        `}
      >
        <span className={`
          font-semibold font-mono text-xs
          ${data.isATM ? 'text-accent-purple' : 'text-text-primary'}
        `}>
          {data.strike.toFixed(0)}¢
        </span>
      </div>

      {/* PUTS (Right Side) */}
      <div
        onClick={handlePutClick}
        className={`
          grid grid-cols-4 gap-1 px-2 py-1.5 cursor-pointer
          transition-all duration-150
          ${data.isITM.put ? 'bg-put/5' : ''}
          ${isPutSelected
            ? 'bg-put/20 ring-1 ring-inset ring-put/40'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        <div className={`text-left font-mono ${Math.abs(data.put.delta) > 0.5 ? 'text-put' : 'text-text-tertiary'}`}>
          {data.put.delta.toFixed(2)}
        </div>
        <div className="text-put text-left font-mono font-medium">
          {data.put.bid.toFixed(2)}
        </div>
        <div className="text-put text-left font-mono font-medium">
          {data.put.ask.toFixed(2)}
        </div>
        <div className="text-text-tertiary text-left font-mono">
          {data.iv.toFixed(0)}%
        </div>
      </div>
    </div>
  )
}

export default OptionsChainRow
