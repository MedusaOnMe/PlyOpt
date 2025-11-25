import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, User, Menu, X, DollarSign, Plus, Key, Eye, EyeOff, Copy, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'
import { AuthModal } from '../auth/AuthModal'
import { Modal } from '../ui/Modal'
import { useToast } from '../../context/ToastContext'

// X (Twitter) icon
function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

export function Header() {
  const { user, isAuthenticated, logout, exportPrivateKey } = useAuth()
  const toast = useToast()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportPassword, setExportPassword] = useState('')
  const [revealedKey, setRevealedKey] = useState('')
  const [showKey, setShowKey] = useState(false)

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
      <header className="bg-secondary border-b border-border sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="PolyPerps" className="w-8 h-8" />
                <span className="text-xl font-bold text-white">PolyPerps</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm font-medium text-text-primary hover:text-accent-blue transition-colors">
                  Trade
                </Link>
                <Link to="/docs" className="text-sm font-medium text-text-secondary hover:text-accent-blue transition-colors">
                  Docs
                </Link>
                <a href="https://x.com/PolyPerpetuals" target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors">
                  <XIcon className="w-4 h-4" />
                </a>
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 px-3 py-2 bg-tertiary rounded-lg hover:bg-border transition-colors"
                  >
                    {user.balance > 0 ? (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent-green" />
                        <span className="text-sm font-medium text-text-primary">
                          ${user.balance?.toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDepositModal(true); setShowUserMenu(false) }}
                        className="flex items-center gap-1.5 px-2 py-1 bg-accent-green/20 rounded text-accent-green text-sm font-medium hover:bg-accent-green/30 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Deposit
                      </button>
                    )}
                    <div className="w-px h-4 bg-border" />
                    <span className="text-sm text-text-secondary max-w-[120px] truncate">
                      {user.email}
                    </span>
                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                  </button>

                  {/* Dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-secondary border border-border rounded-lg shadow-xl py-2 animate-fade-in">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-xs text-text-secondary">Signed in as</p>
                        <p className="text-sm text-text-primary truncate">
                          {user.email}
                        </p>
                      </div>
                      <button className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-tertiary hover:text-text-primary transition-colors flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => { setShowDepositModal(true); setShowUserMenu(false) }}
                        className="w-full px-4 py-2 text-left text-sm text-accent-green hover:bg-tertiary transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Deposit Funds
                      </button>
                      <button
                        onClick={() => { setShowExportModal(true); setShowUserMenu(false) }}
                        className="w-full px-4 py-2 text-left text-sm text-accent-yellow hover:bg-tertiary transition-colors flex items-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Export Private Key
                      </button>
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-accent-red hover:bg-tertiary transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} variant="success" size="md">
                  <User className="w-4 h-4" />
                  Sign Up
                </Button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-tertiary rounded-lg transition-colors"
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
            <nav className="md:hidden mt-4 pt-4 border-t border-border flex flex-col gap-2">
              <Link to="/" className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-tertiary rounded-lg transition-colors">
                Trade
              </Link>
              <Link to="/docs" className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-tertiary rounded-lg transition-colors">
                Docs
              </Link>
              <a href="https://x.com/PolyPerpetuals" target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-tertiary rounded-lg transition-colors flex items-center gap-2">
                <XIcon className="w-4 h-4" />
                Twitter
              </a>
            </nav>
          )}
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title="Deposit Funds" size="md">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-green/20 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-accent-green" />
            </div>
            <p className="text-text-secondary">
              Send USDC to your deposit address to start trading
            </p>
          </div>

          <div className="bg-primary rounded-lg border border-border p-4">
            <p className="text-xs text-text-secondary mb-2">Your Deposit Address (Polygon)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-text-primary font-mono bg-tertiary px-3 py-2 rounded break-all">
                {user?.walletAddress || '0x...'}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(user?.walletAddress || '')}
                className="px-3 py-2 bg-tertiary hover:bg-border rounded text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-4">
            <p className="text-sm text-text-primary">
              <strong>Note:</strong> Only send USDC on Polygon network. Deposits typically confirm within 2-5 minutes.
            </p>
          </div>

          <div className="text-center text-xs text-text-secondary">
            Minimum deposit: $10 USDC
          </div>
        </div>
      </Modal>

      {/* Export Private Key Modal */}
      <Modal isOpen={showExportModal} onClose={closeExportModal} title="Export Private Key" size="md">
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-text-primary font-medium mb-1">Never share your private key</p>
              <p className="text-text-secondary">
                Anyone with your private key has full control of your wallet. Store it securely and never share it.
              </p>
            </div>
          </div>

          {!revealedKey ? (
            <>
              {user?.email && (
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">
                    Enter your password to reveal private key
                  </label>
                  <input
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full bg-primary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-blue transition-colors"
                  />
                </div>
              )}
              <Button onClick={handleExportKey} variant="warning" className="w-full">
                <Key className="w-4 h-4" />
                Reveal Private Key
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-secondary mb-1.5">
                  Your Private Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={revealedKey}
                    readOnly
                    className="w-full bg-primary border border-border rounded-lg px-4 py-2.5 pr-20 text-sm text-text-primary font-mono focus:outline-none"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-1.5 hover:bg-tertiary rounded transition-colors"
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <Eye className="w-4 h-4 text-text-secondary" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="p-1.5 hover:bg-tertiary rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                You can import this private key into any Ethereum-compatible wallet like MetaMask to access your funds on Polygon.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
