import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Shield, Target, BookOpen, Zap, Terminal, ChevronRight, DollarSign, AlertTriangle } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'OVERVIEW', icon: Terminal },
  { id: 'quickstart', label: 'QUICK_START', icon: Zap },
  { id: 'trading', label: 'TRADING', icon: TrendingUp },
  { id: 'leverage', label: 'LEVERAGE', icon: Target },
  { id: 'risk', label: 'RISK', icon: Shield },
]

export function Docs() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="min-h-screen bg-term-black">
      {/* CRT Scanline overlay */}
      <div className="crt-overlay" />

      {/* Header */}
      <header className="bg-term-dark border-b border-term-border sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 text-term-green">
                <Terminal className="w-5 h-5" />
                <span className="text-lg font-bold term-glow">
                  <span className="text-term-text-dim">[</span>
                  POLYNOMIAL
                  <span className="text-term-text-dim">]</span>
                </span>
              </Link>
              <span className="text-term-text-dim text-xs hidden sm:inline">// DOCUMENTATION</span>
            </div>
            <Link to="/" className="flex items-center gap-2 px-3 py-1.5 border border-term-border text-term-text-dim hover:text-term-green hover:border-term-green transition-colors text-xs">
              <ArrowLeft className="w-3 h-3" />
              TRADE
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-56 border-r border-term-border min-h-[calc(100vh-49px)] bg-term-dark">
          <nav className="p-3">
            <div className="text-[10px] text-term-text-dim uppercase tracking-wider mb-3 px-2">
              Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 text-xs transition-colors mb-1 ${
                    activeSection === item.id
                      ? 'text-term-green bg-term-green/10 border-l-2 border-term-green'
                      : 'text-term-text-dim hover:text-term-text border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Quick Stats */}
          <div className="p-3 border-t border-term-border mt-4">
            <div className="text-[10px] text-term-text-dim uppercase tracking-wider mb-3 px-2">
              Platform Stats
            </div>
            <div className="space-y-2 px-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-term-text-dim">MAX_LEVERAGE</span>
                <span className="text-term-green">25x</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-term-text-dim">TRADING_FEE</span>
                <span className="text-term-amber">0.1%</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-term-text-dim">NETWORK</span>
                <span className="text-term-cyan">POLYGON</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-3xl">

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-term-green term-glow mb-2">
                    &gt; SYSTEM_OVERVIEW_
                  </h1>
                  <p className="text-term-text-dim text-sm">
                    Polynomial is a leveraged trading terminal for Polymarket prediction markets.
                  </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-term-dark border border-term-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-term-green" />
                      <span className="text-term-green text-sm">LEVERAGE</span>
                    </div>
                    <p className="text-term-text-dim text-xs">
                      Trade with up to 25x leverage on any prediction market
                    </p>
                  </div>
                  <div className="bg-term-dark border border-term-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-term-cyan" />
                      <span className="text-term-cyan text-sm">LONG/SHORT</span>
                    </div>
                    <p className="text-term-text-dim text-xs">
                      Go long (YES) or short (NO) on any market outcome
                    </p>
                  </div>
                  <div className="bg-term-dark border border-term-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-term-amber" />
                      <span className="text-term-amber text-sm">ORDER_TYPES</span>
                    </div>
                    <p className="text-term-text-dim text-xs">
                      Market and limit orders with real-time execution
                    </p>
                  </div>
                  <div className="bg-term-dark border border-term-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-term-red" />
                      <span className="text-term-red text-sm">RISK_MGMT</span>
                    </div>
                    <p className="text-term-text-dim text-xs">
                      Automatic liquidation engine protects the protocol
                    </p>
                  </div>
                </div>

                {/* Terminal Preview */}
                <div className="bg-term-dark border border-term-border">
                  <div className="px-3 py-2 border-b border-term-border flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-term-red" />
                    <div className="w-2 h-2 rounded-full bg-term-amber" />
                    <div className="w-2 h-2 rounded-full bg-term-green" />
                    <span className="text-[10px] text-term-text-dim ml-2">polynomial_terminal</span>
                  </div>
                  <div className="p-4 font-mono text-xs space-y-1">
                    <div className="text-term-text-dim">&gt; polynomial --help</div>
                    <div className="text-term-text">POLYNOMIAL v1.0 - Leveraged Prediction Markets</div>
                    <div className="text-term-text-dim mt-2">Available commands:</div>
                    <div className="text-term-green pl-4">trade   - Open leveraged positions</div>
                    <div className="text-term-cyan pl-4">markets - Browse prediction markets</div>
                    <div className="text-term-amber pl-4">account - Manage your account</div>
                    <div className="text-term-text-dim mt-2">&gt; <span className="cursor-blink"></span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Start Section */}
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-term-green term-glow mb-2">
                    &gt; QUICK_START_
                  </h1>
                  <p className="text-term-text-dim text-sm">
                    Get trading in under 2 minutes.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'CREATE_ACCOUNT', desc: 'Sign up with email and password. A wallet is automatically generated for you.', color: 'term-green' },
                    { step: 2, title: 'DEPOSIT_FUNDS', desc: 'Send USDC to your deposit address on Polygon network. Minimum $10.', color: 'term-cyan' },
                    { step: 3, title: 'SELECT_MARKET', desc: 'Browse live prediction markets from the sidebar. Click to view charts and order book.', color: 'term-amber' },
                    { step: 4, title: 'OPEN_POSITION', desc: 'Choose YES or NO, set size and leverage (1-25x), then execute.', color: 'term-green' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className={`w-8 h-8 bg-${item.color}/20 text-${item.color} flex items-center justify-center font-bold text-sm shrink-0 border border-${item.color}/30`}>
                        {item.step}
                      </div>
                      <div className="flex-1 bg-term-dark border border-term-border p-3">
                        <div className={`text-${item.color} text-sm mb-1`}>{item.title}</div>
                        <p className="text-term-text-dim text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-term-green/10 border border-term-green/30 p-4">
                  <p className="text-term-green text-xs">
                    <span className="font-bold">TIP:</span> Start with low leverage (1-5x) while learning. Higher leverage = higher risk.
                  </p>
                </div>
              </div>
            )}

            {/* Trading Section */}
            {activeSection === 'trading' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-term-green term-glow mb-2">
                    &gt; TRADING_MECHANICS_
                  </h1>
                  <p className="text-term-text-dim text-sm">
                    How perpetual contracts work on prediction markets.
                  </p>
                </div>

                {/* Long vs Short */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-term-dark border border-term-green/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-term-green" />
                      <span className="text-term-green font-bold">LONG (YES)</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="text-term-text-dim">Profit when probability <span className="text-term-green">increases</span></p>
                      <div className="bg-term-black p-2 font-mono">
                        <div className="text-term-text-dim">Example:</div>
                        <div className="text-term-text">Entry: 40% | Exit: 60%</div>
                        <div className="text-term-text">Leverage: 10x</div>
                        <div className="text-term-green">Profit: +50%</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-term-dark border border-term-red/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-5 h-5 text-term-red" />
                      <span className="text-term-red font-bold">SHORT (NO)</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <p className="text-term-text-dim">Profit when probability <span className="text-term-red">decreases</span></p>
                      <div className="bg-term-black p-2 font-mono">
                        <div className="text-term-text-dim">Example:</div>
                        <div className="text-term-text">Entry: 60% | Exit: 40%</div>
                        <div className="text-term-text">Leverage: 10x</div>
                        <div className="text-term-green">Profit: +33%</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Types */}
                <div className="bg-term-dark border border-term-border p-4">
                  <div className="text-term-amber text-sm mb-3">ORDER_TYPES</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-term-text text-xs mb-1">MARKET</div>
                      <p className="text-term-text-dim text-[10px]">Execute immediately at best available price</p>
                    </div>
                    <div>
                      <div className="text-term-text text-xs mb-1">LIMIT</div>
                      <p className="text-term-text-dim text-[10px]">Execute only when price reaches your target</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leverage Section */}
            {activeSection === 'leverage' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-term-green term-glow mb-2">
                    &gt; LEVERAGE_SYSTEM_
                  </h1>
                  <p className="text-term-text-dim text-sm">
                    Understanding leverage and liquidation mechanics.
                  </p>
                </div>

                {/* Leverage Options */}
                <div className="bg-term-dark border border-term-border p-4">
                  <div className="text-term-amber text-sm mb-3">AVAILABLE_LEVERAGE</div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 5, 10, 15, 20, 25].map(l => (
                      <div key={l} className={`px-3 py-2 border text-xs font-mono ${
                        l <= 5 ? 'border-term-green/50 text-term-green' :
                        l <= 15 ? 'border-term-amber/50 text-term-amber' :
                        'border-term-red/50 text-term-red'
                      }`}>
                        {l}x
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-3 text-[10px]">
                    <span className="text-term-green">1-5x LOW</span>
                    <span className="text-term-amber">10-15x MEDIUM</span>
                    <span className="text-term-red">20-25x HIGH</span>
                  </div>
                </div>

                {/* Liquidation Table */}
                <div className="bg-term-dark border border-term-border">
                  <div className="px-4 py-2 border-b border-term-border">
                    <span className="text-term-red text-sm">LIQUIDATION_THRESHOLDS</span>
                  </div>
                  <div className="p-4">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-term-text-dim text-left">
                          <th className="pb-2">LEVERAGE</th>
                          <th className="pb-2">MARGIN</th>
                          <th className="pb-2">LIQ_MOVE</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono">
                        {[
                          { lev: '5x', margin: '20%', move: '20%' },
                          { lev: '10x', margin: '10%', move: '10%' },
                          { lev: '15x', margin: '6.7%', move: '6.7%' },
                          { lev: '20x', margin: '5%', move: '5%' },
                          { lev: '25x', margin: '4%', move: '4%' },
                        ].map((row) => (
                          <tr key={row.lev} className="border-t border-term-border">
                            <td className="py-2 text-term-cyan">{row.lev}</td>
                            <td className="py-2 text-term-text">{row.margin}</td>
                            <td className="py-2 text-term-red">{row.move}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-term-amber/10 border border-term-amber/30 p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-term-amber shrink-0" />
                  <p className="text-term-amber text-xs">
                    At 25x leverage, a 4% adverse price move will liquidate your entire position. Use appropriate position sizing.
                  </p>
                </div>
              </div>
            )}

            {/* Risk Section */}
            {activeSection === 'risk' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-term-red mb-2">
                    &gt; RISK_WARNING_
                  </h1>
                  <p className="text-term-text-dim text-sm">
                    Important information about trading risks.
                  </p>
                </div>

                <div className="bg-term-red/10 border border-term-red/50 p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-term-red shrink-0" />
                    <div className="space-y-3">
                      <p className="text-term-red text-sm font-bold">
                        LEVERAGED TRADING IS HIGH RISK
                      </p>
                      <ul className="text-term-text-dim text-xs space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-term-red shrink-0 mt-0.5" />
                          You can lose your entire margin if liquidated
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-term-red shrink-0 mt-0.5" />
                          Only trade with funds you can afford to lose
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-term-red shrink-0 mt-0.5" />
                          Past performance is not indicative of future results
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 text-term-red shrink-0 mt-0.5" />
                          Prediction markets can be volatile and illiquid
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-term-dark border border-term-border p-4">
                    <div className="text-term-amber text-sm mb-2">DO</div>
                    <ul className="text-term-text-dim text-xs space-y-1">
                      <li>+ Start with low leverage</li>
                      <li>+ Use appropriate position sizing</li>
                      <li>+ Monitor your positions</li>
                      <li>+ Understand liquidation prices</li>
                    </ul>
                  </div>
                  <div className="bg-term-dark border border-term-border p-4">
                    <div className="text-term-red text-sm mb-2">DON'T</div>
                    <ul className="text-term-text-dim text-xs space-y-1">
                      <li>- Trade with rent money</li>
                      <li>- Use maximum leverage</li>
                      <li>- Ignore liquidation warnings</li>
                      <li>- FOMO into positions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
