import { useState, useEffect } from 'react'
import { X, TrendingUp, Clock, History, AlertTriangle, Wallet } from 'lucide-react'
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
      label: 'History',
      icon: <History className="w-4 h-4" />,
      content: <TradeHistoryList />,
    },
  ]

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
            <Wallet size={24} className="text-text-tertiary" />
          </div>
          <p className="text-sm text-text-secondary">Connect wallet to view positions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={24} className="text-text-tertiary" />
          </div>
          <p className="text-sm text-text-secondary">No open positions</p>
          <p className="text-xs text-text-tertiary mt-1">Open a trade to see it here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-glass-border">
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
          <div key={position.id} className="p-4 hover:bg-glass-hover transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${
                    position.side === 'YES' ? 'badge-call' : 'badge-put'
                  }`}>
                    {position.side} {position.leverage}x
                  </span>
                  {isNearLiquidation && (
                    <span className="flex items-center gap-1 text-xs text-accent-gold">
                      <AlertTriangle size={12} />
                      Near Liq
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-primary truncate">
                  {position.marketQuestion}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-lg font-bold numeric ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {pnlFormatted.text}
                </p>
                <p className={`text-xs numeric ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-3 text-xs">
              <div>
                <span className="text-text-tertiary">Size</span>
                <p className="text-text-primary font-medium numeric">{formatPrice(position.size)}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Entry</span>
                <p className="text-text-primary numeric">{formatCents(position.entryPrice)}</p>
              </div>
              <div>
                <span className="text-text-tertiary">Mark</span>
                <p className={`numeric ${currentPrice > position.entryPrice ? 'text-call' : 'text-put'}`}>
                  {formatCents(currentPrice)}
                </p>
              </div>
              <div>
                <span className="text-text-tertiary">Liq</span>
                <p className="text-loss numeric">{formatCents(position.liquidationPrice)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-glass-border">
              <span className="text-xs text-text-tertiary">
                {formatTimeAgo(position.openedAt)}
              </span>
              <Button
                onClick={() => handleClose(position)}
                loading={closingId === position.id}
                variant="ghost"
                size="sm"
              >
                <X size={14} className="mr-1" />
                Close
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-text-tertiary" />
          </div>
          <p className="text-sm text-text-secondary">No open orders</p>
          <p className="text-xs text-text-tertiary mt-1">Place a limit order to see it here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-glass-border">
      {orders.map((order) => (
        <div key={order.id} className="p-4 hover:bg-glass-hover transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`badge ${
                  order.side === 'YES' ? 'badge-call' : 'badge-put'
                }`}>
                  {order.side} {order.leverage}x
                </span>
                <span className="badge badge-neutral">Limit</span>
              </div>
              <p className="text-sm text-text-primary truncate">
                {order.marketQuestion}
              </p>
            </div>
            <Button
              onClick={() => handleCancel(order)}
              loading={cancellingId === order.id}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
            <div>
              <span className="text-text-tertiary">Size</span>
              <p className="text-text-primary font-medium numeric">{formatPrice(order.size)}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Limit</span>
              <p className="text-accent-purple numeric">{formatCents(order.limitPrice)}</p>
            </div>
            <div>
              <span className="text-text-tertiary">Margin</span>
              <p className="text-text-primary numeric">{formatPrice(order.margin)}</p>
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
            <History size={24} className="text-text-tertiary" />
          </div>
          <p className="text-sm text-text-secondary">No trade history</p>
          <p className="text-xs text-text-tertiary mt-1">Your closed trades will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-glass-border">
      {tradeHistory.map((trade) => {
        const pnlFormatted = trade.pnl !== undefined ? formatPnL(trade.pnl) : null

        return (
          <div key={trade.id} className="p-4 hover:bg-glass-hover transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge ${
                    trade.type === 'OPEN' ? 'bg-accent-purple/20 text-accent-purple border-accent-purple/30' : 'badge-neutral'
                  }`}>
                    {trade.type}
                  </span>
                  <span className={`badge ${
                    trade.side === 'YES' ? 'badge-call' : 'badge-put'
                  }`}>
                    {trade.side} {trade.leverage}x
                  </span>
                </div>
                <p className="text-sm text-text-primary truncate">
                  {trade.marketQuestion}
                </p>
              </div>

              {pnlFormatted && (
                <div className="text-right">
                  <p className={`text-lg font-bold numeric ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {pnlFormatted.text}
                  </p>
                  <p className={`text-xs numeric ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {trade.roi >= 0 ? '+' : ''}{trade.roi?.toFixed(2)}%
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span className="numeric">Size: {formatPrice(trade.size)}</span>
                {trade.entryPrice && <span className="numeric">Entry: {formatCents(trade.entryPrice)}</span>}
                {trade.exitPrice && <span className="numeric">Exit: {formatCents(trade.exitPrice)}</span>}
              </div>
              <span>{formatTimeAgo(trade.timestamp)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
