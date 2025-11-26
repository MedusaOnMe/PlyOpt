import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User, Menu, X, Plus, Key, Eye, EyeOff, Copy, AlertTriangle, ChevronDown, Wallet, ExternalLink, BookOpen, HelpCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMarket } from '../../context/MarketContext'
import { AuthModal } from '../auth/AuthModal'
import { MarketsModal } from '../trading/MarketsModal'
import { Modal } from '../ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatCents, formatChange } from '../../utils/formatters'
import GradientButton from '../ui/GradientButton'

export function Header() {
  const { user, isAuthenticated, logout, exportPrivateKey } = useAuth()
  const { selectedMarket, get24hChange } = useMarket()
  const toast = useToast()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showMarketsModal, setShowMarketsModal] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  const [revealedKey, setRevealedKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const change24h = get24hChange?.() || 0
  const isPositive = change24h >= 0

  // Close markets modal on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowMarketsModal(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowUserMenu(false)
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const handleExportKey = async () => {
    try {
      const privateKey = await exportPrivateKey(exportPassword)
      setRevealedKey(privateKey)
    } catch (err) {
      toast.error(err.message || 'Failed to export private key')
    }
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(revealedKey)
    toast.success('Private key copied to clipboard')
  }

  const closeExportModal = () => {
    setShowExportModal(false)
    setExportPassword('')
    setRevealedKey('')
    setShowKey(false)
  }

  return (
    <>
      <header className="glass-solid border-b border-glass-border sticky top-0 z-40">
        <div className="h-14 px-4 lg:px-6 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center">
              <span className="text-lg font-bold text-text-primary">
                PolyOptions
              </span>
            </Link>

            {/* Market ticker - centered on desktop */}
            {selectedMarket && (
              <button
                onClick={() => setShowMarketsModal(true)}
                className="hidden md:flex items-center gap-4 px-4 py-1.5 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                  <span className="text-sm text-text-secondary max-w-[280px] truncate group-hover:text-text-primary transition-colors">
                    {selectedMarket.question}
                  </span>
                </div>
                <div className="flex items-center gap-3 border-l border-glass-border pl-3">
                  <span className="text-sm font-semibold text-text-primary font-mono">
                    {formatCents(selectedMarket.yesPrice || 0.5)}
                  </span>
                  <span className={`text-xs font-medium font-mono ${isPositive ? 'text-profit' : 'text-loss'}`}>
                    {formatChange(change24h)}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-text-tertiary group-hover:text-text-secondary" />
              </button>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Quick links */}
            <div className="hidden lg:flex items-center gap-1 mr-2">
              <Link
                to="/docs"
                className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-glass-hover transition-all"
                title="Documentation"
              >
                <BookOpen size={18} />
              </Link>
              <a
                href="https://x.com/OptionsPoly"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-glass-hover transition-all"
                title="X / Twitter"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>

            {/* Mobile Markets Button */}
            <button
              onClick={() => setShowMarketsModal(true)}
              className="md:hidden p-2 rounded-lg glass-elevated text-text-secondary"
            >
              <ChevronDown size={18} />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserMenu(!showUserMenu)
                  }}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl glass-elevated hover:bg-bg-tertiary transition-all"
                >
                  <span className="text-sm text-profit font-semibold font-mono">
                    ${user.balance?.toLocaleString() || '0'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-purple to-call flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 glass-elevated rounded-xl shadow-glass-lg overflow-hidden animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-glass-border">
                      <p className="text-sm text-text-primary truncate font-medium">
                        {user.email || `${user.walletAddress?.slice(0, 6)}...${user.walletAddress?.slice(-4)}`}
                      </p>
                    </div>

                    <div className="p-1.5">
                      <button
                        onClick={() => { setShowDepositModal(true); setShowUserMenu(false) }}
                        className="w-full px-3 py-2 rounded-lg text-left text-sm text-text-primary hover:bg-glass-hover transition-all flex items-center gap-2"
                      >
                        <Plus size={16} className="text-profit" />
                        Deposit
                      </button>

                      <button
                        onClick={() => { setShowExportModal(true); setShowUserMenu(false) }}
                        className="w-full px-3 py-2 rounded-lg text-left text-sm text-text-primary hover:bg-glass-hover transition-all flex items-center gap-2"
                      >
                        <Key size={16} className="text-accent-gold" />
                        Export Key
                      </button>
                    </div>

                    <div className="border-t border-glass-border p-1.5">
                      <button
                        onClick={() => {
                          logout()
                          setShowUserMenu(false)
                        }}
                        className="w-full px-3 py-2 rounded-lg text-left text-sm text-loss hover:bg-loss/10 transition-all flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <GradientButton
                variant="purple"
                size="sm"
                onClick={() => setShowAuthModal(true)}
              >
                <Wallet size={14} className="mr-1.5" />
                Connect
              </GradientButton>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-glass-hover transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="lg:hidden px-4 pb-4 pt-2 border-t border-glass-border flex flex-col gap-1 animate-fade-in">
            <Link
              to="/docs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-lg text-sm text-text-primary hover:bg-glass-hover transition-all flex items-center gap-2"
            >
              <BookOpen size={16} />
              Documentation
            </Link>
            <a
              href="https://x.com/OptionsPoly"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-lg text-sm text-text-primary hover:bg-glass-hover transition-all flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </a>
          </nav>
        )}
      </header>

      {/* Markets Modal */}
      <MarketsModal isOpen={showMarketsModal} onClose={() => setShowMarketsModal(false)} />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Deposit Funds" size="md">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Send USDC to your deposit address to start trading options
          </p>

          <div className="p-4 rounded-xl bg-bg-tertiary border border-glass-border">
            <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">
              Deposit Address (Polygon)
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-accent-purple bg-bg-secondary px-3 py-2 rounded-lg break-all font-mono">
                {user?.walletAddress || '0x...'}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user?.walletAddress || '')
                  toast.success('Address copied')
                }}
                className="px-3 py-2 rounded-lg bg-bg-secondary hover:bg-bg-elevated text-text-secondary hover:text-text-primary transition-all"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-accent-gold/10 border border-accent-gold/20">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-accent-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-accent-gold font-medium">Important</p>
                <p className="text-sm text-text-secondary mt-1">
                  Only send USDC on Polygon network. Minimum deposit: $10 USDC
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Export Private Key Modal */}
      <Modal isOpen={showExportModal} onClose={closeExportModal} title="Export Private Key" size="md">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-loss/10 border border-loss/20">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-loss shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-loss font-medium">Security Warning</p>
                <p className="text-sm text-text-secondary mt-1">
                  Never share your private key. Anyone with access has full control of your funds.
                </p>
              </div>
            </div>
          </div>

          {!revealedKey ? (
            <>
              {user?.email && (
                <div>
                  <label className="block text-xs text-text-tertiary uppercase tracking-wider mb-2">
                    Enter password to decrypt
                  </label>
                  <input
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-purple"
                  />
                </div>
              )}
              <GradientButton
                variant="outline"
                size="lg"
                fullWidth
                onClick={handleExportKey}
              >
                <Key size={16} className="mr-2" />
                Reveal Private Key
              </GradientButton>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-tertiary uppercase tracking-wider mb-2">
                  Private Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={revealedKey}
                    readOnly
                    className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-3 pr-20 text-sm text-accent-purple font-mono"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded-lg hover:bg-glass-hover transition-colors"
                    >
                      {showKey ? (
                        <EyeOff size={16} className="text-text-tertiary" />
                      ) : (
                        <Eye size={16} className="text-text-tertiary" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="p-2 rounded-lg hover:bg-glass-hover transition-colors"
                    >
                      <Copy size={16} className="text-text-tertiary" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-tertiary">
                Import this key into MetaMask or any EVM wallet to access your funds on Polygon.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
