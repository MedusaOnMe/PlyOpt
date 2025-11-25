import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MarketProvider } from './context/MarketContext'
import { PositionProvider } from './context/PositionContext'
import { ToastProvider } from './context/ToastContext'
import { Header } from './components/layout/Header'
import { TradingChart } from './components/trading/TradingChart'
import { OrderBook } from './components/trading/OrderBook'
import { OrderEntry } from './components/trading/OrderEntry'
import { MarketStats } from './components/trading/MarketStats'
import { PositionsPanel } from './components/positions/PositionsPanel'
import { ToastContainer } from './components/ui/Toast'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { Docs } from './pages/Docs'

function TradingPage() {
  return (
    <div className="min-h-screen bg-term-black">
      {/* CRT Scanline overlay */}
      <div className="crt-overlay" />

      <Header />

      {/* Main content - full width now */}
      <main className="h-[calc(100vh-49px)] overflow-auto">
        <div className="p-2 lg:p-3">
          {/* Two column layout */}
          <div className="flex flex-col xl:flex-row gap-2 lg:gap-3">

            {/* Left Column: Chart + Stats + Positions */}
            <div className="flex-1 flex flex-col gap-2 lg:gap-3 min-w-0">
              {/* Chart - Main focus */}
              <div className="h-[500px] lg:h-[580px]">
                <TradingChart />
              </div>

              {/* Market Stats - Horizontal bar */}
              <MarketStats />

              {/* Positions Panel */}
              <PositionsPanel />
            </div>

            {/* Right Column: Order Entry + Order Book stacked */}
            <div className="xl:w-[380px] flex flex-col gap-2 lg:gap-3">
              {/* Order Entry on top */}
              <div className="h-auto">
                <OrderEntry />
              </div>

              {/* Order Book below */}
              <div className="h-[380px] xl:h-[400px]">
                <OrderBook />
              </div>
            </div>
          </div>
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  const [showApp, setShowApp] = useState(false)

  useEffect(() => {
    // Check if we've already shown the loading screen this session
    const hasLoaded = sessionStorage.getItem('polynomial_loaded')
    if (hasLoaded) {
      setLoading(false)
      setShowApp(true)
    }
  }, [])

  const handleLoadingComplete = () => {
    sessionStorage.setItem('polynomial_loaded', 'true')
    setLoading(false)
    setTimeout(() => setShowApp(true), 100)
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MarketProvider>
            <PositionProvider>
              {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
              {showApp && (
                <Routes>
                  <Route path="/" element={<TradingPage />} />
                  <Route path="/docs" element={<Docs />} />
                </Routes>
              )}
            </PositionProvider>
          </MarketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
