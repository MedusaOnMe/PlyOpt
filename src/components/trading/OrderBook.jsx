import { useMemo } from 'react'
import { useMarket } from '../../context/MarketContext'
import { formatCents, formatNumber, formatCompact } from '../../utils/formatters'

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
      <div className="bg-term-dark border border-term-border h-full flex items-center justify-center">
        <div className="text-xs text-term-text-dim">
          &gt; NO_DATA_
        </div>
      </div>
    )
  }

  return (
    <div className="bg-term-dark border border-term-border h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2 border-b border-term-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-term-text-dim uppercase tracking-wider">ORDER_BOOK</span>
          <div className="flex items-center gap-1.5">
            <div className="status-online" />
            <span className="text-xs text-term-text-dim">LIVE</span>
          </div>
        </div>
      </div>

      {/* Column headers */}
      <div className="px-3 py-1.5 border-b border-term-border">
        <div className="flex justify-between text-xs text-term-text-dim uppercase">
          <span>PRICE</span>
          <span>SIZE</span>
          <span>TOTAL</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-term-text-dim loading-dots">LOADING</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Asks (NO side - red) */}
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
          <div className="px-3 py-2 bg-term-black border-y border-term-border">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-term-green term-glow">
                {formatCents(currentPrice)}
              </span>
              <span className="text-xs text-term-text-dim">
                SPR: {formatCents(spread)}
              </span>
            </div>
          </div>

          {/* Bids (YES side - green) */}
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
      <div className="px-3 py-2 border-t border-term-border">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-term-text-dim">BID VOL</span>
            <p className="text-term-green">
              {formatCompact(bids.reduce((acc, b) => acc + b.size * b.price, 0))}
            </p>
          </div>
          <div className="text-right">
            <span className="text-term-text-dim">ASK VOL</span>
            <p className="text-term-red">
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
    <div className="relative px-3 py-1 hover:bg-term-gray cursor-pointer">
      {/* Depth bar */}
      <div
        className={`absolute inset-y-0 ${side === 'bid' ? 'left-0 depth-bar-green' : 'right-0 depth-bar-red'}`}
        style={{ width: `${depthPercent}%` }}
      />

      {/* Content */}
      <div className="relative flex justify-between text-xs">
        <span className={side === 'bid' ? 'text-term-green' : 'text-term-red'}>
          {formatCents(price)}
        </span>
        <span className="text-term-text">{formatNumber(size, 0)}</span>
        <span className="text-term-text-dim">{formatNumber(total, 0)}</span>
      </div>
    </div>
  )
}
