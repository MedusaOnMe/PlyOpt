import { useState } from 'react'
import { Mail, Eye, EyeOff, Wallet } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import GradientButton from '../ui/GradientButton'

export function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('register') // 'login' or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, login } = useAuth()
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }
        if (!email.includes('@')) {
          throw new Error('Please enter a valid email')
        }
        await register(email, password)
        toast.success('Account created! Welcome to PolyOptions!')
      } else {
        await login(email, password)
        toast.success('Welcome back!')
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} size="md">
      <div>
        {/* Logo and header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-call via-accent-purple to-put flex items-center justify-center">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {mode === 'register' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-text-secondary text-sm">
            {mode === 'register'
              ? 'Trade options on any prediction market'
              : 'Sign in to access your account'
            }
          </p>
          {mode === 'register' && (
            <p className="text-xs text-profit mt-1">Email verification is NOT required</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg border border-loss/30 bg-loss/10 text-sm text-loss">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs text-text-tertiary uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-bg-tertiary border border-glass-border rounded-lg pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-purple focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-tertiary uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-3 pr-10 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-purple focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs text-text-tertiary uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                className="w-full bg-bg-tertiary border border-glass-border rounded-lg px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent-purple focus:outline-none transition-colors"
              />
            </div>
          )}

          <GradientButton
            type="submit"
            loading={loading}
            variant="purple"
            size="lg"
            fullWidth
          >
            {mode === 'register' ? 'Create Account' : 'Sign In'}
          </GradientButton>
        </form>

        <p className="text-sm text-text-secondary text-center mt-4">
          {mode === 'register' ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); resetForm() }}
                className="text-accent-purple hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('register'); resetForm() }}
                className="text-accent-purple hover:underline font-medium"
              >
                Create one
              </button>
            </>
          )}
        </p>
      </div>
    </Modal>
  )
}
