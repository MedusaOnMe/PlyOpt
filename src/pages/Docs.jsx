import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Shield, Target, BookOpen, Zap, ChevronRight, DollarSign, AlertTriangle, ArrowUpCircle, ArrowDownCircle, PenTool } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'quickstart', label: 'Quick Start', icon: Zap },
  { id: 'options', label: 'Options Basics', icon: Target },
  { id: 'trading', label: 'Trading', icon: TrendingUp },
  { id: 'writing', label: 'Writing Options', icon: PenTool },
  { id: 'risk', label: 'Risk', icon: Shield },
]

export function Docs() {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="glass-solid border-b border-glass-border sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-lg font-bold text-text-primary">
                PolyOptions
              </Link>
              <span className="text-text-tertiary text-sm hidden sm:inline">/ Documentation</span>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-tertiary hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Trading
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block w-56 border-r border-glass-border min-h-[calc(100vh-57px)] bg-bg-secondary">
          <nav className="p-4">
            <div className="text-xs text-text-tertiary uppercase tracking-wider mb-3 px-2">
              Documentation
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all mb-1 ${
                    activeSection === item.id
                      ? 'text-accent-purple bg-accent-purple/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-glass-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Quick Info */}
          <div className="p-4 border-t border-glass-border">
            <div className="text-xs text-text-tertiary uppercase tracking-wider mb-3 px-2">
              Platform Info
            </div>
            <div className="space-y-2 px-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">Network</span>
                <span className="text-accent-purple">Polygon</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">Settlement</span>
                <span className="text-text-primary">USDC</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-tertiary">Pricing</span>
                <span className="text-text-primary">Black-Scholes</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-3xl">

            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-3">
                    What is PolyOptions?
                  </h1>
                  <p className="text-text-secondary">
                    PolyOptions is a derivatives layer for Polymarket prediction markets.
                    Trade calls and puts on any market outcome with proper options pricing,
                    Greeks, and risk management.
                  </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpCircle className="w-5 h-5 text-call" />
                      <span className="text-text-primary font-medium">Call Options</span>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      Profit when the market probability increases above your strike price
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownCircle className="w-5 h-5 text-put" />
                      <span className="text-text-primary font-medium">Put Options</span>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      Profit when the market probability decreases below your strike price
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-accent-purple" />
                      <span className="text-text-primary font-medium">Real Greeks</span>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      Delta, Gamma, Theta, Vega - all calculated using Black-Scholes
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="flex items-center gap-2 mb-2">
                      <PenTool className="w-5 h-5 text-accent-cyan" />
                      <span className="text-text-primary font-medium">Write Options</span>
                    </div>
                    <p className="text-text-tertiary text-sm">
                      Earn premium by writing options and providing liquidity
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/30">
                  <p className="text-text-primary text-sm">
                    <span className="font-semibold text-accent-purple">Why options?</span> Options let you
                    express more nuanced views than simple yes/no bets. Define your risk, leverage your
                    conviction, or earn yield by writing options.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Start Section */}
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-3">
                    Quick Start
                  </h1>
                  <p className="text-text-secondary">
                    Get trading options in under 2 minutes.
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Create Account', desc: 'Sign up with email and password. A Polygon wallet is automatically created for you.', color: 'call' },
                    { step: 2, title: 'Deposit USDC', desc: 'Send USDC to your deposit address on Polygon network. Minimum $10.', color: 'accent-purple' },
                    { step: 3, title: 'Select Market', desc: 'Choose a prediction market from the sidebar. View the options chain for available strikes.', color: 'accent-cyan' },
                    { step: 4, title: 'Trade Options', desc: 'Select a strike, choose call or put, pick buy or sell, and execute your trade.', color: 'call' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className={`w-8 h-8 rounded-lg bg-${item.color}/20 text-${item.color} flex items-center justify-center font-bold text-sm shrink-0`}>
                        {item.step}
                      </div>
                      <div className="flex-1 p-4 rounded-xl bg-bg-secondary border border-glass-border">
                        <div className="text-text-primary font-medium mb-1">{item.title}</div>
                        <p className="text-text-tertiary text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-call/10 border border-call/30">
                  <p className="text-call text-sm">
                    <span className="font-semibold">Tip:</span> Start by buying options to limit your risk.
                    Writing options requires margin and has unlimited loss potential.
                  </p>
                </div>
              </div>
            )}

            {/* Options Basics Section */}
            {activeSection === 'options' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-3">
                    Options Basics
                  </h1>
                  <p className="text-text-secondary">
                    Understanding call and put options on prediction markets.
                  </p>
                </div>

                {/* Call vs Put */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-bg-secondary border border-call/30">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-call" />
                      <span className="text-call font-bold">CALL Option</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p className="text-text-secondary">Right to buy at the strike price</p>
                      <div className="p-3 rounded-lg bg-bg-tertiary">
                        <div className="text-text-tertiary text-xs mb-1">Example:</div>
                        <div className="text-text-primary">Strike: 50¢</div>
                        <div className="text-text-primary">Market moves: 50¢ → 70¢</div>
                        <div className="text-call font-medium">Profit: 20¢ per contract</div>
                      </div>
                      <p className="text-text-tertiary text-xs">
                        Buy calls when you think probability will increase
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-bg-secondary border border-put/30">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-5 h-5 text-put" />
                      <span className="text-put font-bold">PUT Option</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <p className="text-text-secondary">Right to sell at the strike price</p>
                      <div className="p-3 rounded-lg bg-bg-tertiary">
                        <div className="text-text-tertiary text-xs mb-1">Example:</div>
                        <div className="text-text-primary">Strike: 50¢</div>
                        <div className="text-text-primary">Market moves: 50¢ → 30¢</div>
                        <div className="text-call font-medium">Profit: 20¢ per contract</div>
                      </div>
                      <p className="text-text-tertiary text-xs">
                        Buy puts when you think probability will decrease
                      </p>
                    </div>
                  </div>
                </div>

                {/* Greeks */}
                <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                  <div className="text-text-primary font-medium mb-3">The Greeks</div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <div className="text-accent-purple font-mono text-lg">Δ Delta</div>
                      <p className="text-text-tertiary text-xs">Price sensitivity to underlying</p>
                    </div>
                    <div>
                      <div className="text-accent-cyan font-mono text-lg">Γ Gamma</div>
                      <p className="text-text-tertiary text-xs">Rate of delta change</p>
                    </div>
                    <div>
                      <div className="text-put font-mono text-lg">Θ Theta</div>
                      <p className="text-text-tertiary text-xs">Time decay per day</p>
                    </div>
                    <div>
                      <div className="text-call font-mono text-lg">ν Vega</div>
                      <p className="text-text-tertiary text-xs">Sensitivity to volatility</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trading Section */}
            {activeSection === 'trading' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-3">
                    Trading Options
                  </h1>
                  <p className="text-text-secondary">
                    How to buy and sell options on PolyOptions.
                  </p>
                </div>

                {/* Buy vs Sell */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUpCircle className="w-5 h-5 text-call" />
                      <span className="text-call font-bold">BUY (Long)</span>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-call shrink-0 mt-0.5" />
                        Pay premium upfront
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-call shrink-0 mt-0.5" />
                        Maximum loss = premium paid
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-call shrink-0 mt-0.5" />
                        Unlimited profit potential
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-call shrink-0 mt-0.5" />
                        No margin required
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowDownCircle className="w-5 h-5 text-put" />
                      <span className="text-put font-bold">SELL (Write)</span>
                    </div>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                        Receive premium upfront
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                        Maximum profit = premium received
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                        Unlimited loss potential
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                        Margin required
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Strike Selection */}
                <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                  <div className="text-text-primary font-medium mb-3">Choosing a Strike</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-accent-purple/20 text-accent-purple text-xs font-medium">ATM</span>
                      <span className="text-text-secondary">At-the-money: Strike ≈ current price. Highest gamma.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-call/20 text-call text-xs font-medium">ITM</span>
                      <span className="text-text-secondary">In-the-money: Higher delta, more expensive, lower risk.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 rounded bg-put/20 text-put text-xs font-medium">OTM</span>
                      <span className="text-text-secondary">Out-of-the-money: Lower delta, cheaper, higher risk.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Writing Options Section */}
            {activeSection === 'writing' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-3">
                    Writing Options
                  </h1>
                  <p className="text-text-secondary">
                    Earn premium by providing liquidity as an options writer.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/30">
                  <div className="flex items-center gap-2 mb-2">
                    <PenTool className="w-5 h-5 text-accent-purple" />
                    <span className="text-accent-purple font-medium">Be the First Writer</span>
                  </div>
                  <p className="text-text-secondary text-sm">
                    Many options on new markets have no liquidity yet. By writing options, you become the
                    market maker and set the price. Look for "WRITE" badges on the options chain.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                  <div className="text-text-primary font-medium mb-3">How Writing Works</div>
                  <ol className="space-y-3 text-sm text-text-secondary">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Select an option with no liquidity (marked "WRITE")</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Choose SELL to write the option</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Post margin (collateral) to cover potential losses</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-accent-purple/20 text-accent-purple flex items-center justify-center text-xs font-bold shrink-0">4</span>
                      <span>Receive premium immediately when someone buys your option</span>
                    </li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl bg-put/10 border border-put/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-put shrink-0 mt-0.5" />
                    <div>
                      <p className="text-put font-medium text-sm">Warning: Unlimited Loss Potential</p>
                      <p className="text-text-secondary text-sm mt-1">
                        Writing options exposes you to potentially unlimited losses. Only write options
                        if you understand the risks and can afford to lose your entire margin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Section */}
            {activeSection === 'risk' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-3">
                    Risk Disclosure
                  </h1>
                  <p className="text-text-secondary">
                    Important information about trading risks.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-put/10 border border-put/30">
                  <div className="flex items-start gap-4">
                    <Shield className="w-8 h-8 text-put shrink-0" />
                    <div className="space-y-3">
                      <p className="text-put font-bold">
                        OPTIONS TRADING INVOLVES SIGNIFICANT RISK
                      </p>
                      <ul className="text-text-secondary text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                          Buyers can lose their entire premium
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                          Writers face unlimited loss potential
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                          Only trade with funds you can afford to lose
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                          Prediction markets can be volatile and illiquid
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-put shrink-0 mt-0.5" />
                          Past performance does not guarantee future results
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="text-call font-medium mb-2">Best Practices</div>
                    <ul className="text-text-secondary text-sm space-y-1">
                      <li>+ Start with buying options</li>
                      <li>+ Use small position sizes</li>
                      <li>+ Understand the Greeks</li>
                      <li>+ Monitor time decay</li>
                      <li>+ Diversify across markets</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-bg-secondary border border-glass-border">
                    <div className="text-put font-medium mb-2">Avoid</div>
                    <ul className="text-text-secondary text-sm space-y-1">
                      <li>- Trading with rent money</li>
                      <li>- Writing naked options</li>
                      <li>- Ignoring expiration dates</li>
                      <li>- Over-concentrating positions</li>
                      <li>- Chasing losses</li>
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
