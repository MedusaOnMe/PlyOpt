import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { MarketProvider } from './context/MarketContext'
import { PositionProvider } from './context/PositionContext'
import { ToastProvider } from './context/ToastContext'
import { OptionsProvider } from './context/OptionsContext'
import { Header } from './components/layout/Header'
import { MarketsSidebar } from './components/layout/MarketsSidebar'
import { TradingChart } from './components/trading/TradingChart'
import { OrderBook } from './components/trading/OrderBook'
import { PositionsPanel } from './components/positions/PositionsPanel'
import OptionsChain from './components/options/OptionsChain'
import OptionsOrderPanel from './components/options/OptionsOrderPanel'
import PayoffDiagram from './components/options/PayoffDiagram'
import { ToastContainer } from './components/ui/Toast'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { Docs } from './pages/Docs'
import GlassCard from './components/ui/GlassCard'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

function TradingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen bg-bg-primary flex flex-col overflow-hidden">
      <Header />

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Collapsible Markets Sidebar */}
        <div className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-72' : 'w-0'}`}>
          {sidebarOpen && <MarketsSidebar />}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center w-5 bg-bg-secondary hover:bg-bg-tertiary border-r border-glass-border transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft size={14} className="text-text-tertiary" />
          ) : (
            <ChevronRight size={14} className="text-text-tertiary" />
          )}
        </button>

        {/* Trading workspace */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top row: Chart + Order Panel side by side */}
          <div className="flex-1 flex gap-px bg-glass-border min-h-0">
            {/* Chart - takes most space */}
            <div className="flex-[70] min-w-0 bg-bg-primary">
              <TradingChart />
            </div>

            {/* Right panel: Order + Payoff stacked */}
            <div className="hidden xl:flex flex-col w-[340px] bg-bg-primary">
              <div className="flex-[60] border-b border-glass-border overflow-hidden">
                <OptionsOrderPanel />
              </div>
              <div className="flex-[40] overflow-hidden">
                <PayoffDiagram />
              </div>
            </div>
          </div>

          {/* Bottom row: Options Chain + Order Book + Positions */}
          <div className="h-[280px] flex gap-px bg-glass-border border-t border-glass-border">
            {/* Options Chain - main focus */}
            <div className="flex-[55] min-w-0 bg-bg-primary overflow-hidden">
              <OptionsChain />
            </div>

            {/* Order Book */}
            <div className="hidden lg:block w-[240px] bg-bg-primary overflow-hidden">
              <OrderBook />
            </div>

            {/* Positions */}
            <div className="hidden xl:block w-[280px] bg-bg-primary overflow-hidden">
              <PositionsPanel />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile layout */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-30">
        <MobileBottomNav />
      </div>

      <ToastContainer />
    </div>
  )
}

function MobileBottomNav() {
  const [activePanel, setActivePanel] = useState(null)

  return (
    <>
      {/* Panel content */}
      {activePanel && (
        <div className="bg-bg-primary border-t border-glass-border h-[50vh] overflow-hidden animate-slide-up">
          {activePanel === 'order' && <OptionsOrderPanel />}
          {activePanel === 'payoff' && <PayoffDiagram />}
          {activePanel === 'positions' && <PositionsPanel />}
        </div>
      )}

      {/* Bottom nav bar */}
      <div className="glass-solid border-t border-glass-border px-2 py-2 flex items-center justify-around">
        <button
          onClick={() => setActivePanel(activePanel === 'order' ? null : 'order')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activePanel === 'order' ? 'bg-accent-purple/20 text-accent-purple' : 'text-text-tertiary'
          }`}
        >
          <LayoutGrid size={18} />
          <span className="text-[10px] font-medium">Trade</span>
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'payoff' ? null : 'payoff')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activePanel === 'payoff' ? 'bg-accent-purple/20 text-accent-purple' : 'text-text-tertiary'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-8 4 4 6-8" />
          </svg>
          <span className="text-[10px] font-medium">Payoff</span>
        </button>
        <button
          onClick={() => setActivePanel(activePanel === 'positions' ? null : 'positions')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
            activePanel === 'positions' ? 'bg-accent-purple/20 text-accent-purple' : 'text-text-tertiary'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
          </svg>
          <span className="text-[10px] font-medium">Positions</span>
        </button>
      </div>
    </>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  const [showApp, setShowApp] = useState(false)

  const handleLoadingComplete = () => {
    setLoading(false)
    setTimeout(() => setShowApp(true), 100)
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <MarketProvider>
            <PositionProvider>
              <OptionsProvider>
                {loading && <LoadingScreen onComplete={handleLoadingComplete} />}
                {showApp && (
                  <Routes>
                    <Route path="/" element={<TradingPage />} />
                    <Route path="/docs" element={<Docs />} />
                  </Routes>
                )}
              </OptionsProvider>
            </PositionProvider>
          </MarketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
