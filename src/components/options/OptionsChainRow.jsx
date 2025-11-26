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

  const formatVolume = (vol) => {
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
    return vol.toString()
  }

  const formatOI = (oi) => {
    if (oi >= 1000) return (oi / 1000).toFixed(1) + 'K'
    return oi.toString()
  }

  return (
    <div
      className={`
        grid grid-cols-[1fr_auto_1fr] gap-0 text-[10px]
        border-b border-glass-border/30 last:border-b-0
        ${data.isATM ? 'bg-accent-purple/8' : ''}
      `}
    >
      {/* CALLS (Left Side) - 7 columns: OI, Vol, Δ, γ, Ask, Bid, IV */}
      <div
        onClick={handleCallClick}
        className={`
          grid grid-cols-7 gap-0.5 px-1.5 py-1 cursor-pointer
          transition-all duration-100
          ${data.isITM.call ? 'bg-call/5' : ''}
          ${isCallSelected
            ? 'bg-call/20 ring-1 ring-inset ring-call/50'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        <div className="text-text-tertiary text-right font-mono tabular-nums">
          {formatOI(data.call.openInterest)}
        </div>
        <div className="text-text-tertiary text-right font-mono tabular-nums">
          {formatVolume(data.call.volume)}
        </div>
        <div className={`text-right font-mono tabular-nums ${data.call.delta > 0.5 ? 'text-call' : 'text-text-secondary'}`}>
          {data.call.delta.toFixed(2)}
        </div>
        <div className="text-text-tertiary text-right font-mono tabular-nums">
          {data.call.gamma.toFixed(3)}
        </div>
        <div className="text-call text-right font-mono font-medium tabular-nums">
          {data.call.ask.toFixed(2)}
        </div>
        <div className="text-call text-right font-mono font-medium tabular-nums">
          {data.call.bid.toFixed(2)}
        </div>
        <div className="text-text-tertiary text-right font-mono tabular-nums">
          {data.iv.toFixed(0)}%
        </div>
      </div>

      {/* STRIKE (Center) */}
      <div
        className={`
          flex items-center justify-center px-2 py-1
          border-x border-glass-border/50
          ${data.isATM ? 'bg-accent-purple/25' : 'bg-bg-tertiary/50'}
        `}
      >
        <span className={`
          font-bold font-mono text-[11px]
          ${data.isATM ? 'text-accent-purple' : 'text-text-primary'}
        `}>
          {data.strike.toFixed(0)}¢
        </span>
      </div>

      {/* PUTS (Right Side) - 7 columns: IV, Bid, Ask, γ, Δ, Vol, OI */}
      <div
        onClick={handlePutClick}
        className={`
          grid grid-cols-7 gap-0.5 px-1.5 py-1 cursor-pointer
          transition-all duration-100
          ${data.isITM.put ? 'bg-put/5' : ''}
          ${isPutSelected
            ? 'bg-put/20 ring-1 ring-inset ring-put/50'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        <div className="text-text-tertiary text-left font-mono tabular-nums">
          {data.iv.toFixed(0)}%
        </div>
        <div className="text-put text-left font-mono font-medium tabular-nums">
          {data.put.bid.toFixed(2)}
        </div>
        <div className="text-put text-left font-mono font-medium tabular-nums">
          {data.put.ask.toFixed(2)}
        </div>
        <div className="text-text-tertiary text-left font-mono tabular-nums">
          {Math.abs(data.put.gamma).toFixed(3)}
        </div>
        <div className={`text-left font-mono tabular-nums ${Math.abs(data.put.delta) > 0.5 ? 'text-put' : 'text-text-secondary'}`}>
          {data.put.delta.toFixed(2)}
        </div>
        <div className="text-text-tertiary text-left font-mono tabular-nums">
          {formatVolume(data.put.volume)}
        </div>
        <div className="text-text-tertiary text-left font-mono tabular-nums">
          {formatOI(data.put.openInterest)}
        </div>
      </div>
    </div>
  )
}

export default OptionsChainRow
