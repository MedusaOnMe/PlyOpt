import { useOptions } from '../../context/OptionsContext'

function OptionsChainRow({ data }) {
  const { selectedStrike, selectedType, selectStrike, selectType } = useOptions()

  const isSelected = selectedStrike === data.strike
  const isCallSelected = isSelected && selectedType === 'CALL'
  const isPutSelected = isSelected && selectedType === 'PUT'

  // Check availability
  const callAvailable = data.call.available
  const putAvailable = data.put.available

  const handleCallClick = () => {
    selectStrike(data.strike)
    selectType('CALL')
  }

  const handlePutClick = () => {
    selectStrike(data.strike)
    selectType('PUT')
  }

  const formatVolume = (vol) => {
    if (vol === 0) return '--'
    if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K'
    return vol.toString()
  }

  const formatOI = (oi) => {
    if (oi === 0) return '--'
    if (oi >= 1000) return (oi / 1000).toFixed(1) + 'K'
    return oi.toString()
  }

  const formatPrice = (price) => {
    if (price === 0) return '--'
    return price.toFixed(2)
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
          grid grid-cols-7 gap-0.5 px-1.5 py-1 cursor-pointer relative
          transition-all duration-100
          ${!callAvailable ? 'opacity-60' : ''}
          ${data.isITM.call && callAvailable ? 'bg-call/5' : ''}
          ${isCallSelected
            ? callAvailable
              ? 'bg-call/20 ring-1 ring-inset ring-call/50'
              : 'bg-accent-purple/15 ring-1 ring-inset ring-accent-purple/50'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        {/* WRITE badge for unavailable options */}
        {!callAvailable && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] font-bold text-accent-purple/70 bg-accent-purple/10 px-1.5 py-0.5 rounded border border-accent-purple/20">
              WRITE
            </span>
          </div>
        )}
        <div className={`text-right font-mono tabular-nums ${callAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {formatOI(data.call.openInterest)}
        </div>
        <div className={`text-right font-mono tabular-nums ${callAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {formatVolume(data.call.volume)}
        </div>
        <div className={`text-right font-mono tabular-nums ${callAvailable ? (data.call.delta > 0.5 ? 'text-call' : 'text-text-secondary') : 'text-transparent'}`}>
          {data.call.delta.toFixed(2)}
        </div>
        <div className={`text-right font-mono tabular-nums ${callAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {data.call.gamma.toFixed(3)}
        </div>
        <div className={`text-right font-mono font-medium tabular-nums ${callAvailable ? 'text-call' : 'text-transparent'}`}>
          {formatPrice(data.call.ask)}
        </div>
        <div className={`text-right font-mono font-medium tabular-nums ${callAvailable ? 'text-call' : 'text-transparent'}`}>
          {formatPrice(data.call.bid)}
        </div>
        <div className={`text-right font-mono tabular-nums ${callAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
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
          grid grid-cols-7 gap-0.5 px-1.5 py-1 cursor-pointer relative
          transition-all duration-100
          ${!putAvailable ? 'opacity-60' : ''}
          ${data.isITM.put && putAvailable ? 'bg-put/5' : ''}
          ${isPutSelected
            ? putAvailable
              ? 'bg-put/20 ring-1 ring-inset ring-put/50'
              : 'bg-accent-purple/15 ring-1 ring-inset ring-accent-purple/50'
            : 'hover:bg-glass-hover'
          }
        `}
      >
        {/* WRITE badge for unavailable options */}
        {!putAvailable && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] font-bold text-accent-purple/70 bg-accent-purple/10 px-1.5 py-0.5 rounded border border-accent-purple/20">
              WRITE
            </span>
          </div>
        )}
        <div className={`text-left font-mono tabular-nums ${putAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {data.iv.toFixed(0)}%
        </div>
        <div className={`text-left font-mono font-medium tabular-nums ${putAvailable ? 'text-put' : 'text-transparent'}`}>
          {formatPrice(data.put.bid)}
        </div>
        <div className={`text-left font-mono font-medium tabular-nums ${putAvailable ? 'text-put' : 'text-transparent'}`}>
          {formatPrice(data.put.ask)}
        </div>
        <div className={`text-left font-mono tabular-nums ${putAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {Math.abs(data.put.gamma).toFixed(3)}
        </div>
        <div className={`text-left font-mono tabular-nums ${putAvailable ? (Math.abs(data.put.delta) > 0.5 ? 'text-put' : 'text-text-secondary') : 'text-transparent'}`}>
          {data.put.delta.toFixed(2)}
        </div>
        <div className={`text-left font-mono tabular-nums ${putAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {formatVolume(data.put.volume)}
        </div>
        <div className={`text-left font-mono tabular-nums ${putAvailable ? 'text-text-tertiary' : 'text-transparent'}`}>
          {formatOI(data.put.openInterest)}
        </div>
      </div>
    </div>
  )
}

export default OptionsChainRow
