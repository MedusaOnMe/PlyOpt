import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, User, Menu, X, Plus, Key, Eye, EyeOff, Copy, AlertTriangle, ChevronDown, BarChart3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useMarket } from '../../context/MarketContext'
import { AuthModal } from '../auth/AuthModal'
import { MarketsModal } from '../trading/MarketsModal'
import { Modal } from '../ui/Modal'
import { useToast } from '../../context/ToastContext'
import { formatCents } from '../../utils/formatters'

export function Header() {
  const { user, isAuthenticated, logout, exportPrivateKey } = useAuth()
  const { selectedMarket } = useMarket()
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

  // Close markets modal on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowMarketsModal(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

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
      <header className="bg-term-dark border-b border-term-border sticky top-0 z-40">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left side: Logo + Nav + Markets */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 mr-2">
                <div className="text-term-green text-lg font-bold tracking-tight term-glow">
                  <span className="text-term-text-dim">[</span>
                  POLYNOMIAL
                  <span className="text-term-text-dim">]</span>
                </div>
              </Link>

              {/* Nav Links - right next to logo */}
              <nav className="hidden md:flex items-center">
                <Link to="/" className="px-2.5 py-1.5 text-xs text-term-text-dim hover:text-term-green transition-colors">
                  TERMINAL
                </Link>
                <Link to="/docs" className="px-2.5 py-1.5 text-xs text-term-text-dim hover:text-term-green transition-colors">
                  ABOUT
                </Link>
                <a
                  href="https://x.com/PolyPerpetuals"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 text-xs text-term-text-dim hover:text-term-green transition-colors"
                >
                  X
                </a>
              </nav>

              {/* Divider */}
              <div className="hidden md:block w-px h-5 bg-term-border mx-2" />

              {/* Markets Button - More prominent */}
              <button
                onClick={() => setShowMarketsModal(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 border-2 border-term-green bg-term-green/10 hover:bg-term-green/20 transition-all group"
                style={{ boxShadow: '0 0 15px #00ff41, 0 0 30px rgba(0,255,65,0.4)' }}
              >
                <BarChart3 className="w-4 h-4 text-term-green" />
                {selectedMarket ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-term-text max-w-[200px] truncate">
                      {selectedMarket.question}
                    </span>
                    <span className="text-sm text-term-green font-bold term-glow">
                      {formatCents(selectedMarket.yesPrice || 0.5)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-term-green font-medium">SELECT MARKET</span>
                )}
                <ChevronDown className="w-3 h-3 text-term-green" />
              </button>

              {/* Mobile Markets Button */}
              <button
                onClick={() => setShowMarketsModal(true)}
                className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-term-green bg-term-green/10"
                style={{ boxShadow: '0 0 15px #00ff41, 0 0 30px rgba(0,255,65,0.4)' }}
              >
                <BarChart3 className="w-4 h-4 text-term-green" />
                <span className="text-sm text-term-green font-medium">MARKETS</span>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="hidden lg:flex items-center gap-2 text-[10px] text-term-text-dim">
                <div className="status-online" />
                <span>LIVE</span>
              </div>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-3 py-1.5 border border-term-border hover:border-term-green/50 transition-colors"
                  >
                    {user.balance > 0 ? (
                      <span className="text-xs text-term-green">
                        ${user.balance?.toLocaleString()}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDepositModal(true); setShowUserMenu(false) }}
                        className="flex items-center gap-1 text-xs text-term-amber hover:text-term-amber-dim"
                      >
                        <Plus className="w-3 h-3" />
                        DEPOSIT
                      </button>
                    )}
                    <span className="text-term-border">|</span>
                    <span className="text-xs text-term-text max-w-[80px] truncate">
                      {user.email || user.walletAddress?.slice(0, 6)}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-1 w-56 bg-black border border-term-border shadow-xl z-50">
                      <div className="px-3 py-2 border-b border-term-border bg-black">
                        <p className="text-[10px] text-term-text-dim uppercase">Session</p>
                        <p className="text-xs text-term-text truncate mt-1">
                          {user.email || user.walletAddress?.slice(0, 20)}
                        </p>
                      </div>
                      <button
                        onClick={() => { setShowDepositModal(true); setShowUserMenu(false) }}
                        className="w-full px-3 py-2 text-left text-xs text-term-green hover:bg-term-green/10 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        &gt; DEPOSIT
                      </button>
                      <button
                        onClick={() => { setShowExportModal(true); setShowUserMenu(false) }}
                        className="w-full px-3 py-2 text-left text-xs text-term-amber hover:bg-term-amber/10 transition-colors flex items-center gap-2"
                      >
                        <Key className="w-3 h-3" />
                        &gt; EXPORT_KEY
                      </button>
                      <div className="border-t border-term-border">
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-term-red hover:bg-term-red/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-3 h-3" />
                          &gt; LOGOUT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 px-4 py-1.5 border border-term-green text-term-green text-xs hover:bg-term-green hover:text-term-black transition-colors"
                >
                  <User className="w-3 h-3" />
                  CONNECT
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-term-gray transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4 text-term-text" />
                ) : (
                  <Menu className="w-4 h-4 text-term-text" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-3 pt-3 border-t border-term-border flex flex-col">
              <Link to="/" className="px-3 py-2 text-xs text-term-text-dim hover:text-term-green">
                TERMINAL
              </Link>
              <Link to="/docs" className="px-3 py-2 text-xs text-term-text-dim hover:text-term-green">
                ABOUT
              </Link>
              <a href="https://x.com/PolyPerpetuals" target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-xs text-term-text-dim hover:text-term-green">
                X
              </a>
            </nav>
          )}
        </div>
      </header>

      {/* Markets Modal */}
      <MarketsModal isOpen={showMarketsModal} onClose={() => setShowMarketsModal(false)} />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="DEPOSIT" size="md">
        <div className="space-y-4">
          <div className="text-xs text-term-text-dim">
            Send USDC to your deposit address to start trading
          </div>

          <div className="border border-term-border p-3">
            <p className="text-[10px] text-term-text-dim uppercase mb-2">Deposit Address (Polygon)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-term-green bg-term-black px-2 py-1.5 break-all">
                {user?.walletAddress || '0x...'}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user?.walletAddress || '')
                  toast.success('Address copied')
                }}
                className="px-2 py-1.5 border border-term-border text-xs text-term-text hover:border-term-green hover:text-term-green transition-colors"
              >
                COPY
              </button>
            </div>
          </div>

          <div className="border border-term-amber/30 bg-term-amber/5 p-3 text-xs text-term-amber">
            <strong>NOTE:</strong> Only send USDC on Polygon network.
          </div>

          <div className="text-center text-[10px] text-term-text-dim">
            MIN DEPOSIT: $10 USDC
          </div>
        </div>
      </Modal>

      {/* Export Private Key Modal */}
      <Modal isOpen={showExportModal} onClose={closeExportModal} title="EXPORT_KEY" size="md">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 border border-term-red/30 bg-term-red/5">
            <AlertTriangle className="w-4 h-4 text-term-red flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="text-term-red font-medium mb-1">WARNING: SENSITIVE DATA</p>
              <p className="text-term-text-dim">
                Never share your private key. Anyone with access has full control.
              </p>
            </div>
          </div>

          {!revealedKey ? (
            <>
              {user?.email && (
                <div>
                  <label className="block text-[10px] text-term-text-dim uppercase mb-1">
                    Enter password to decrypt
                  </label>
                  <input
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="********"
                    className="w-full bg-term-black border border-term-border px-3 py-2 text-xs text-term-text placeholder:text-term-text-dim"
                  />
                </div>
              )}
              <button
                onClick={handleExportKey}
                className="w-full px-4 py-2 border border-term-amber text-term-amber text-xs hover:bg-term-amber hover:text-term-black transition-colors"
              >
                &gt; REVEAL_KEY
              </button>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] text-term-text-dim uppercase mb-1">
                  Private Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={revealedKey}
                    readOnly
                    className="w-full bg-term-black border border-term-border px-3 py-2 pr-16 text-xs text-term-green"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 hover:bg-term-gray"
                    >
                      {showKey ? (
                        <EyeOff className="w-3 h-3 text-term-text-dim" />
                      ) : (
                        <Eye className="w-3 h-3 text-term-text-dim" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="p-1 hover:bg-term-gray"
                    >
                      <Copy className="w-3 h-3 text-term-text-dim" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-term-text-dim">
                Import this key into MetaMask or any EVM wallet to access funds on Polygon.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
