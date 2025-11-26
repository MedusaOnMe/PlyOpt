import { useMemo } from 'react'
import { useMarket } from '../../context/MarketContext'
import { formatCents, formatNumber } from '../../utils/formatters'
import { Activity } from 'lucide-react'

export function OrderBook() {
  const { orderBook, selectedMarket, isLoading, getCurrentPrice } = useMarket()

  const { bids, asks, maxSize, spread } = useMemo(() => {
    const allSizes = [...orderBook.bids, ...orderBook.asks].map(o => o.size)
    const maxSize = Math.max(...allSizes, 1)

    const topBid = orderBook.bids[0]?.price || 0
    const topAsk = orderBook.asks[0]?.price || 1
    const spread = topAsk - topBid

    return {
      bids: orderBook.bids.slice(0, 6),
      asks: orderBook.asks.slice(0, 6).reverse(),
      maxSize,
      spread,
    }
  }, [orderBook])

  const currentPrice = getCurrentPrice()

  if (!selectedMarket) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity size={20} className="mx-auto mb-2 text-text-tertiary" />
          <p className="text-xs text-text-secondary">No market selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-glass-border flex items-center justify-between shrink-0">
        <h3 className="text-xs font-semibold text-text-primary">Order Book</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
          <span className="text-[10px] text-text-tertiary">Live</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="px-3 py-1.5 border-b border-glass-border bg-bg-secondary/30 shrink-0">
        <div className="flex justify-between text-[9px] text-text-tertiary uppercase tracking-wider">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-text-tertiary">Loading...</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {/* Asks */}
          <div className="flex-1 flex flex-col justify-end overflow-hidden">
            {asks.map((order, i) => (
              <OrderRow key={`ask-${i}`} price={order.price} size={order.size} maxSize={maxSize} side="ask" />
            ))}
          </div>

          {/* Spread / Current price */}
          <div className="px-3 py-2 bg-bg-tertiary/50 border-y border-glass-border shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-accent-purple font-mono">
                {formatCents(currentPrice)}
              </span>
              <div className="text-right">
                <span className="text-[9px] text-text-tertiary block">Spread</span>
                <span className="text-[10px] text-text-secondary font-mono">{formatCents(spread)}</span>
              </div>
            </div>
          </div>

          {/* Bids */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {bids.map((order, i) => (
              <OrderRow key={`bid-${i}`} price={order.price} size={order.size} maxSize={maxSize} side="bid" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function OrderRow({ price, size, maxSize, side }) {
  const depthPercent = (size / maxSize) * 100
  const total = price * size

  return (
    <div className="relative px-3 py-1 hover:bg-glass-hover cursor-pointer transition-colors">
      {/* Depth bar */}
      <div
        className={`absolute inset-y-0 ${side === 'bid' ? 'left-0 bg-call/10' : 'right-0 bg-put/10'}`}
        style={{ width: `${depthPercent}%` }}
      />

      {/* Content */}
      <div className="relative flex justify-between text-[11px]">
        <span className={`font-medium font-mono ${side === 'bid' ? 'text-call' : 'text-put'}`}>
          {formatCents(price)}
        </span>
        <span className="text-text-secondary font-mono">{formatNumber(size, 0)}</span>
        <span className="text-text-tertiary font-mono">{formatNumber(total, 0)}</span>
      </div>
    </div>
  )
}
