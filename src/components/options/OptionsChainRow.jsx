import { useOptions } from '../../context/OptionsContext'

function OptionsChainRow({ data }) {
  const { selectedStrike, selectedType, selectStrike, selectType, spotPrice } = useOptions()

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
        grid grid-cols-[1fr_auto_1fr] gap-0 text-xs
        border-b border-glass-border last:border-b-0
        ${data.isATM ? 'atm-strike' : ''}
      `}
    >
      {/* CALLS (Left Side) */}
      <div
        onClick={handleCallClick}
        className={`
          grid grid-cols-5 gap-2 px-3 py-2.5 cursor-pointer
          transition-all duration-150
          ${data.isITM.call ? 'itm-call' : ''}
          ${isCallSelected
            ? 'bg-call-surface ring-1 ring-call/50'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        <div className="text-text-tertiary text-right numeric">
          {formatVolume(data.call.volume)}
        </div>
        <div className="text-text-tertiary text-right numeric">
          {formatVolume(data.call.openInterest)}
        </div>
        <div className="text-call text-right numeric font-medium">
          {data.call.bid.toFixed(2)}
        </div>
        <div className="text-call text-right numeric font-medium">
          {data.call.ask.toFixed(2)}
        </div>
        <div className={`text-right numeric ${data.call.delta > 0 ? 'text-call' : 'text-put'}`}>
          {data.call.delta > 0 ? '+' : ''}{data.call.delta.toFixed(2)}
        </div>
      </div>

      {/* STRIKE (Center) */}
      <div
        className={`
          flex flex-col items-center justify-center px-4 py-2
          bg-bg-secondary border-x border-glass-border min-w-[80px]
          ${data.isATM ? 'bg-accent-purple/20' : ''}
        `}
      >
        <span className={`
          font-semibold numeric
          ${data.isATM ? 'text-accent-purple text-glow-purple' : 'text-text-primary'}
        `}>
          {data.strike.toFixed(0)}¢
        </span>
        <span className="text-[10px] text-text-tertiary">
          IV: {data.iv.toFixed(0)}%
        </span>
      </div>

      {/* PUTS (Right Side) */}
      <div
        onClick={handlePutClick}
        className={`
          grid grid-cols-5 gap-2 px-3 py-2.5 cursor-pointer
          transition-all duration-150
          ${data.isITM.put ? 'itm-put' : ''}
          ${isPutSelected
            ? 'bg-put-surface ring-1 ring-put/50'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        <div className={`text-left numeric ${data.put.delta < 0 ? 'text-put' : 'text-call'}`}>
          {data.put.delta.toFixed(2)}
        </div>
        <div className="text-put text-left numeric font-medium">
          {data.put.bid.toFixed(2)}
        </div>
        <div className="text-put text-left numeric font-medium">
          {data.put.ask.toFixed(2)}
        </div>
        <div className="text-text-tertiary text-left numeric">
          {formatVolume(data.put.openInterest)}
        </div>
        <div className="text-text-tertiary text-left numeric">
          {formatVolume(data.put.volume)}
        </div>
      </div>
    </div>
  )
}

function formatVolume(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export default OptionsChainRow
