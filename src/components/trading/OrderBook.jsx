import { useMemo } from 'react'
import { useMarket } from '../../context/MarketContext'
import { formatCents, formatNumber, formatCompact } from '../../utils/formatters'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'

export function OrderBook() {
  const { orderBook, selectedMarket, isLoading, getCurrentPrice } = useMarket()

  const { bids, asks, maxSize, spread } = useMemo(() => {
    const allSizes = [...orderBook.bids, ...orderBook.asks].map(o => o.size)
    const maxSize = Math.max(...allSizes, 1)

    const topBid = orderBook.bids[0]?.price || 0
    const topAsk = orderBook.asks[0]?.price || 1
    const spread = topAsk - topBid

    return {
      bids: orderBook.bids.slice(0, 8),
      asks: orderBook.asks.slice(0, 8).reverse(),
      maxSize,
      spread,
    }
  }, [orderBook])

  const currentPrice = getCurrentPrice()

  if (!selectedMarket) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Activity size={24} className="mx-auto mb-2 text-text-tertiary" />
          <p className="text-sm text-text-secondary">No market selected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-glass-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Order Book</h3>
          <div className="flex items-center gap-2">
            <div className="status-live" />
            <span className="text-xs text-text-secondary">Live</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="px-4 py-2 border-b border-glass-border bg-bg-secondary/30">
        <div className="flex justify-between text-[10px] text-text-tertiary uppercase tracking-wider">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse-soft" />
            <span className="text-sm text-text-secondary">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Asks (Puts - red) */}
          <div className="flex-1 overflow-hidden">
            {asks.map((order, i) => (
              <OrderRow
                key={`ask-${i}`}
                price={order.price}
                size={order.size}
                maxSize={maxSize}
                side="ask"
              />
            ))}
          </div>

          {/* Spread / Current price */}
          <div className="px-4 py-3 bg-bg-tertiary/50 border-y border-glass-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-accent-purple numeric text-glow-purple">
                  {formatCents(currentPrice)}
                </span>
                <span className="badge badge-neutral">
                  Spot
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-tertiary">Spread</span>
                <p className="text-sm text-text-secondary numeric">{formatCents(spread)}</p>
              </div>
            </div>
          </div>

          {/* Bids (Calls - cyan) */}
          <div className="flex-1 overflow-hidden">
            {bids.map((order, i) => (
              <OrderRow
                key={`bid-${i}`}
                price={order.price}
                size={order.size}
                maxSize={maxSize}
                side="bid"
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer stats */}
      <div className="px-4 py-3 border-t border-glass-border">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-text-tertiary mb-1">
              <TrendingUp size={12} className="text-call" />
              <span>Bid Volume</span>
            </div>
            <p className="text-call font-medium numeric">
              {formatCompact(bids.reduce((acc, b) => acc + b.size * b.price, 0))}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-text-tertiary mb-1 justify-end">
              <TrendingDown size={12} className="text-put" />
              <span>Ask Volume</span>
            </div>
            <p className="text-put font-medium numeric">
              {formatCompact(asks.reduce((acc, a) => acc + a.size * (1 - a.price), 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function OrderRow({ price, size, maxSize, side }) {
  const depthPercent = (size / maxSize) * 100
  const total = price * size

  return (
    <div className="relative px-4 py-1.5 hover:bg-glass-hover cursor-pointer transition-colors">
      {/* Depth bar */}
      <div
        className={`absolute inset-y-0 ${side === 'bid' ? 'left-0 depth-bar-call' : 'right-0 depth-bar-put'}`}
        style={{ width: `${depthPercent}%` }}
      />

      {/* Content */}
      <div className="relative flex justify-between text-xs">
        <span className={`font-medium numeric ${side === 'bid' ? 'text-call' : 'text-put'}`}>
          {formatCents(price)}
        </span>
        <span className="text-text-secondary numeric">{formatNumber(size, 0)}</span>
        <span className="text-text-tertiary numeric">{formatNumber(total, 0)}</span>
      </div>
    </div>
  )
}
