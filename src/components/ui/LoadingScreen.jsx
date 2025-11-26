import { useState, useEffect } from 'react'
import { TrendingUp, Activity, Zap, Shield, BarChart3, Wifi } from 'lucide-react'

export function LoadingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [complete, setComplete] = useState(false)

  const loadingSteps = [
    { text: 'Initializing PolyOptions', icon: Zap, delay: 300 },
    { text: 'Connecting to markets', icon: Wifi, delay: 400 },
    { text: 'Loading options chain', icon: BarChart3, delay: 500 },
    { text: 'Fetching price data', icon: Activity, delay: 400 },
    { text: 'Calculating Greeks', icon: TrendingUp, delay: 350 },
    { text: 'Ready to trade', icon: Shield, delay: 300 },
  ]

  useEffect(() => {
    let totalDelay = 0

    loadingSteps.forEach((_, index) => {
      totalDelay += loadingSteps[index].delay
      setTimeout(() => {
        setCurrentStep(index + 1)
      }, totalDelay)
    })

    totalDelay += 500
    setTimeout(() => {
      setComplete(true)
      setTimeout(onComplete, 400)
    }, totalDelay)
  }, [])

  const progress = (currentStep / loadingSteps.length) * 100

  return (
    <div className="fixed inset-0 bg-bg-primary z-50 flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-[120px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-call/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-put/10 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative w-full max-w-md px-8">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-call via-accent-purple to-put bg-clip-text text-transparent">
              PolyOptions
            </span>
          </h1>
          <p className="text-text-tertiary text-sm">Prediction Market Options</p>
        </div>

        {/* Loading steps */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="space-y-3">
            {loadingSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === index + 1
              const isComplete = currentStep > index + 1
              const isPending = currentStep < index + 1

              return (
                <div
                  key={index}
                  className={`
                    flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300
                    ${isActive ? 'bg-accent-purple/10' : ''}
                    ${isComplete ? 'opacity-50' : ''}
                    ${isPending ? 'opacity-30' : ''}
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-accent-purple text-white' : ''}
                    ${isComplete ? 'bg-profit/20 text-profit' : ''}
                    ${isPending ? 'bg-glass-hover text-text-tertiary' : ''}
                  `}>
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                    )}
                  </div>
                  <span className={`
                    text-sm font-medium transition-colors duration-300
                    ${isActive ? 'text-text-primary' : ''}
                    ${isComplete ? 'text-text-tertiary' : ''}
                    ${isPending ? 'text-text-tertiary' : ''}
                  `}>
                    {step.text}
                  </span>
                  {isActive && (
                    <div className="ml-auto flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00D4FF, #8B5CF6, #FF3D71)',
            }}
          />
        </div>

        {/* Status text */}
        <p className={`
          text-center text-xs mt-4 transition-all duration-300
          ${complete ? 'text-profit' : 'text-text-tertiary'}
        `}>
          {complete ? 'Launch successful' : `${Math.round(progress)}% complete`}
        </p>
      </div>
    </div>
  )
}
