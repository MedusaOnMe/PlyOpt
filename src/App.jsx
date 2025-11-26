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
import { ChevronLeft, ChevronRight, LayoutGrid, LineChart, List } from 'lucide-react'

function TradingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileTab, setMobileTab] = useState('chart')

  return (
    <div className="h-screen bg-bg-primary flex flex-col overflow-hidden">
      <Header />

      {/* Main content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Collapsible Markets Sidebar */}
        <div className={`hidden lg:flex transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
          <MarketsSidebar />
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center w-4 bg-bg-secondary hover:bg-bg-tertiary border-x border-glass-border transition-colors shrink-0"
        >
          {sidebarOpen ? (
            <ChevronLeft size={12} className="text-text-tertiary" />
          ) : (
            <ChevronRight size={12} className="text-text-tertiary" />
          )}
        </button>

        {/* Main workspace - Desktop */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          {/* Top section: Chart + Order Panel */}
          <div className="flex-[55] flex min-h-0 border-b border-glass-border">
            {/* Chart */}
            <div className="flex-1 min-w-0 border-r border-glass-border">
              <TradingChart />
            </div>

            {/* Right column: Order Panel + Payoff */}
            <div className="w-[360px] flex flex-col shrink-0">
              <div className="flex-[65] border-b border-glass-border overflow-hidden">
                <OptionsOrderPanel />
              </div>
              <div className="flex-[35] overflow-hidden">
                <PayoffDiagram />
              </div>
            </div>
          </div>

          {/* Bottom section: Options Chain + Order Book + Positions */}
          <div className="flex-[45] flex min-h-0">
            {/* Options Chain - main focus */}
            <div className="flex-1 min-w-0 border-r border-glass-border overflow-hidden">
              <OptionsChain />
            </div>

            {/* Order Book */}
            <div className="w-[280px] border-r border-glass-border overflow-hidden shrink-0">
              <OrderBook />
            </div>

            {/* Positions */}
            <div className="w-[320px] overflow-hidden shrink-0">
              <PositionsPanel />
            </div>
          </div>
        </div>

        {/* Mobile workspace */}
        <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
          {/* Mobile content based on tab */}
          <div className="flex-1 overflow-hidden">
            {mobileTab === 'chart' && <TradingChart />}
            {mobileTab === 'chain' && <OptionsChain />}
            {mobileTab === 'trade' && (
              <div className="h-full flex flex-col">
                <div className="flex-[60] border-b border-glass-border overflow-auto">
                  <OptionsOrderPanel />
                </div>
                <div className="flex-[40] overflow-hidden">
                  <PayoffDiagram />
                </div>
              </div>
            )}
            {mobileTab === 'positions' && <PositionsPanel />}
          </div>

          {/* Mobile bottom nav */}
          <div className="shrink-0 glass-solid border-t border-glass-border">
            <div className="flex items-center justify-around py-2">
              <MobileNavButton
                active={mobileTab === 'chart'}
                onClick={() => setMobileTab('chart')}
                icon={<LineChart size={20} />}
                label="Chart"
              />
              <MobileNavButton
                active={mobileTab === 'chain'}
                onClick={() => setMobileTab('chain')}
                icon={<List size={20} />}
                label="Options"
              />
              <MobileNavButton
                active={mobileTab === 'trade'}
                onClick={() => setMobileTab('trade')}
                icon={<LayoutGrid size={20} />}
                label="Trade"
              />
              <MobileNavButton
                active={mobileTab === 'positions'}
                onClick={() => setMobileTab('positions')}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                }
                label="Positions"
              />
            </div>
          </div>
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}

function MobileNavButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-all ${
        active
          ? 'text-accent-purple'
          : 'text-text-tertiary hover:text-text-secondary'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
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
