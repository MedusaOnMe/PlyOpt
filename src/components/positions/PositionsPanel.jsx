import { useState, useEffect } from 'react'
import { X, TrendingUp, Clock, History, AlertTriangle } from 'lucide-react'
import { usePositions } from '../../context/PositionContext'
import { useMarket } from '../../context/MarketContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Tabs } from '../ui/Tabs'
import { Button } from '../ui/Button'
import { formatCents, formatPrice, formatPnL, formatTimeAgo, calculatePnL, calculateROI } from '../../utils/formatters'

export function PositionsPanel() {
  const { positions, orders, tradeHistory, closePosition, cancelOrder } = usePositions()
  const { isAuthenticated } = useAuth()

  const tabs = [
    {
      id: 'positions',
      label: 'Positions',
      icon: <TrendingUp className="w-4 h-4" />,
      count: positions.length,
      content: <PositionsList />,
    },
    {
      id: 'orders',
      label: 'Open Orders',
      icon: <Clock className="w-4 h-4" />,
      count: orders.length,
      content: <OrdersList />,
    },
    {
      id: 'history',
      label: 'Trade History',
      icon: <History className="w-4 h-4" />,
      content: <TradeHistoryList />,
    },
  ]

  if (!isAuthenticated) {
    return (
      <div className="bg-term-dark border border-term-border p-8">
        <div className="text-center text-sm text-term-text-dim">
          &gt; CONNECT_WALLET_TO_VIEW_POSITIONS_
        </div>
      </div>
    )
  }

  return (
    <div className="bg-term-dark border border-term-border">
      <Tabs tabs={tabs} defaultTab="positions" />
    </div>
  )
}

function PositionsList() {
  const { positions, closePosition, getPositionPnL } = usePositions()
  const { markets, getCurrentPrice } = useMarket()
  const toast = useToast()
  const [closingId, setClosingId] = useState(null)

  // Simulated live price updates
  const [prices, setPrices] = useState({})

  useEffect(() => {
    // Initialize prices
    const initial = {}
    positions.forEach(p => {
      initial[p.marketId] = p.entryPrice + (Math.random() - 0.5) * 0.1
    })
    setPrices(initial)

    // Update prices periodically
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev }
        positions.forEach(p => {
          const current = updated[p.marketId] || p.entryPrice
          const change = (Math.random() - 0.48) * 0.02
          updated[p.marketId] = Math.max(0.01, Math.min(0.99, current + change))
        })
        return updated
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [positions])

  const handleClose = async (position) => {
    setClosingId(position.id)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      const currentPrice = prices[position.marketId] || position.entryPrice
      const result = closePosition(position.id, currentPrice)

      if (result.pnl >= 0) {
        toast.success(`Position closed! Profit: +$${result.pnl.toFixed(2)}`)
      } else {
        toast.warning(`Position closed. Loss: -$${Math.abs(result.pnl).toFixed(2)}`)
      }
    } catch (err) {
      toast.error('Failed to close position')
    } finally {
      setClosingId(null)
    }
  }

  if (positions.length === 0) {
    return (
      <div className="p-8 text-center text-term-text-dim">
        <TrendingUp className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">&gt; NO_OPEN_POSITIONS_</p>
        <p className="text-xs mt-1">Open a trade to see it here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-term-border">
      {positions.map((position) => {
        const currentPrice = prices[position.marketId] || position.entryPrice
        const pnl = getPositionPnL(position, currentPrice)
        const roi = calculateROI(pnl, position.margin)
        const pnlFormatted = formatPnL(pnl)

        // Check if near liquidation
        const priceToLiq = position.side === 'YES'
          ? currentPrice - position.liquidationPrice
          : position.liquidationPrice - currentPrice
        const isNearLiquidation = priceToLiq < 0.05

        return (
          <div key={position.id} className="p-3 hover:bg-term-gray/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 text-xs font-medium ${
                    position.side === 'YES'
                      ? 'bg-term-green/20 text-term-green'
                      : 'bg-term-red/20 text-term-red'
                  }`}>
                    {position.side} {position.leverage}x
                  </span>
                  {isNearLiquidation && (
                    <span className="flex items-center gap-1 text-xs text-term-amber">
                      <AlertTriangle className="w-3 h-3" />
                      LIQ_RISK
                    </span>
                  )}
                </div>
                <p className="text-sm text-term-text truncate">
                  {position.marketQuestion}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-base font-bold ${pnl >= 0 ? 'text-term-green' : 'text-term-red'}`}>
                  {pnlFormatted.text}
                </p>
                <p className={`text-xs ${pnl >= 0 ? 'text-term-green' : 'text-term-red'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-2 text-xs">
              <div>
                <span className="text-term-text-dim">SIZE</span>
                <p className="text-term-text">{formatPrice(position.size)}</p>
              </div>
              <div>
                <span className="text-term-text-dim">ENTRY</span>
                <p className="text-term-text">{formatCents(position.entryPrice)}</p>
              </div>
              <div>
                <span className="text-term-text-dim">MARK</span>
                <p className={currentPrice > position.entryPrice ? 'text-term-green' : 'text-term-red'}>
                  {formatCents(currentPrice)}
                </p>
              </div>
              <div>
                <span className="text-term-text-dim">LIQ</span>
                <p className="text-term-red">{formatCents(position.liquidationPrice)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-term-border">
              <span className="text-xs text-term-text-dim">
                {formatTimeAgo(position.openedAt)}
              </span>
              <Button
                onClick={() => handleClose(position)}
                loading={closingId === position.id}
                variant="ghost"
                size="sm"
              >
                <X className="w-3 h-3" />
                CLOSE
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function OrdersList() {
  const { orders, cancelOrder } = usePositions()
  const toast = useToast()
  const [cancellingId, setCancellingId] = useState(null)

  const handleCancel = async (order) => {
    setCancellingId(order.id)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      cancelOrder(order.id)
      toast.success('Order cancelled')
    } catch (err) {
      toast.error('Failed to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center text-term-text-dim">
        <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">&gt; NO_OPEN_ORDERS_</p>
        <p className="text-xs mt-1">Place a limit order to see it here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-term-border">
      {orders.map((order) => (
        <div key={order.id} className="p-3 hover:bg-term-gray/30 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-1.5 py-0.5 text-xs font-medium ${
                  order.side === 'YES'
                    ? 'bg-term-green/20 text-term-green'
                    : 'bg-term-red/20 text-term-red'
                }`}>
                  {order.side} {order.leverage}x LIMIT
                </span>
              </div>
              <p className="text-sm text-term-text truncate">
                {order.marketQuestion}
              </p>
            </div>
            <Button
              onClick={() => handleCancel(order)}
              loading={cancellingId === order.id}
              variant="ghost"
              size="sm"
            >
              CANCEL
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
            <div>
              <span className="text-term-text-dim">SIZE</span>
              <p className="text-term-text">{formatPrice(order.size)}</p>
            </div>
            <div>
              <span className="text-term-text-dim">LIMIT</span>
              <p className="text-term-cyan">{formatCents(order.limitPrice)}</p>
            </div>
            <div>
              <span className="text-term-text-dim">MARGIN</span>
              <p className="text-term-text">{formatPrice(order.margin)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function TradeHistoryList() {
  const { tradeHistory } = usePositions()

  if (tradeHistory.length === 0) {
    return (
      <div className="p-8 text-center text-term-text-dim">
        <History className="w-6 h-6 mx-auto mb-2 opacity-50" />
        <p className="text-sm">&gt; NO_TRADE_HISTORY_</p>
        <p className="text-xs mt-1">Your closed trades will appear here</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-term-border">
      {tradeHistory.map((trade) => {
        const pnlFormatted = trade.pnl !== undefined ? formatPnL(trade.pnl) : null

        return (
          <div key={trade.id} className="p-3 hover:bg-term-gray/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-1.5 py-0.5 text-xs font-medium ${
                    trade.type === 'OPEN' ? 'bg-term-cyan/20 text-term-cyan' : 'bg-term-gray text-term-text-dim'
                  }`}>
                    {trade.type}
                  </span>
                  <span className={`px-1.5 py-0.5 text-xs font-medium ${
                    trade.side === 'YES'
                      ? 'bg-term-green/20 text-term-green'
                      : 'bg-term-red/20 text-term-red'
                  }`}>
                    {trade.side} {trade.leverage}x
                  </span>
                </div>
                <p className="text-sm text-term-text truncate">
                  {trade.marketQuestion}
                </p>
              </div>

              {pnlFormatted && (
                <div className="text-right">
                  <p className={`text-base font-bold ${trade.pnl >= 0 ? 'text-term-green' : 'text-term-red'}`}>
                    {pnlFormatted.text}
                  </p>
                  <p className={`text-xs ${trade.pnl >= 0 ? 'text-term-green' : 'text-term-red'}`}>
                    {trade.roi >= 0 ? '+' : ''}{trade.roi?.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-term-text-dim">
              <div className="flex items-center gap-4">
                <span>SIZE: {formatPrice(trade.size)}</span>
                {trade.entryPrice && <span>ENTRY: {formatCents(trade.entryPrice)}</span>}
                {trade.exitPrice && <span>EXIT: {formatCents(trade.exitPrice)}</span>}
              </div>
              <span>{formatTimeAgo(trade.timestamp)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
