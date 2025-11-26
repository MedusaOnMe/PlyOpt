// API Base URLs - using proxy to avoid CORS
export const GAMMA_API = '/gamma-api'
export const CLOB_API = '/clob-api'

// Direct URLs (for reference)
export const GAMMA_API_DIRECT = 'https://gamma-api.polymarket.com'
export const CLOB_API_DIRECT = 'https://clob.polymarket.com'

// Categories for filtering
export const CATEGORIES = [
  { id: 'all', name: 'All Markets', icon: 'Flame' },
  { id: 'politics', name: 'Politics', icon: 'Vote' },
  { id: 'crypto', name: 'Crypto', icon: 'Bitcoin' },
  { id: 'sports', name: 'Sports', icon: 'Trophy' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Tv' },
  { id: 'science', name: 'Science', icon: 'Microscope' },
  { id: 'business', name: 'Business', icon: 'TrendingUp' },
]

// Options-specific constants
export const OPTION_TYPES = ['CALL', 'PUT']
export const POSITION_DIRECTIONS = ['LONG', 'SHORT']

// Greeks configuration
export const GREEKS_CONFIG = [
  { key: 'delta', symbol: 'Δ', name: 'Delta', description: 'Price sensitivity to underlying movement', range: [-1, 1] },
  { key: 'gamma', symbol: 'Γ', name: 'Gamma', description: 'Rate of change in delta', range: [0, 0.5] },
  { key: 'theta', symbol: 'Θ', name: 'Theta', description: 'Time decay per day', range: [-0.5, 0] },
  { key: 'vega', symbol: 'V', name: 'Vega', description: 'Sensitivity to implied volatility', range: [0, 0.5] },
  { key: 'iv', symbol: 'IV', name: 'Implied Vol', description: 'Market expected volatility', range: [0, 200] },
]

// Expiration intervals (days)
export const EXPIRATION_INTERVALS = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 90,
}

// Strike price generation
export const STRIKE_COUNT = 11 // Number of strikes to show (centered around ATM)
export const STRIKE_STEP_PERCENT = 0.05 // 5% increments

// Trading fees
export const TRADING_FEE_BPS = 5 // 0.05%
export const MIN_PREMIUM = 0.01 // $0.01 minimum premium

// Chart timeframes - fidelity values from Polymarket API docs
export const TIMEFRAMES = [
  { label: '1H', interval: '1h', fidelity: 1 },
  { label: '6H', interval: '6h', fidelity: 1 },
  { label: '1D', interval: '1d', fidelity: 5 },
  { label: '1W', interval: '1w', fidelity: 60 },
  { label: 'ALL', interval: 'max', fidelity: 60 },
]

// Default starting balance
export const DEFAULT_BALANCE = 10000
export const DEFAULT_QUANTITY = 1

// Risk thresholds
export const HIGH_IV_THRESHOLD = 100 // 100% IV is considered high
export const NEAR_EXPIRY_DAYS = 3 // Days until expiry to show warning

// UI Constants
export const ANIMATION_DURATION = 200
export const DEBOUNCE_DELAY = 300

// Platform stats (simulated)
export const PLATFORM_STATS = {
  totalVolume: 125000000,
  openInterest: 45000000,
  totalTraders: 12400,
  totalMarkets: 850,
}
