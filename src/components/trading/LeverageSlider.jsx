import { LEVERAGE_OPTIONS } from '../../utils/constants'

export function LeverageSlider({ value, onChange }) {
  const handleSliderChange = (e) => {
    const sliderValue = parseInt(e.target.value)
    // Map slider position to leverage value
    const index = Math.round((sliderValue / 100) * (LEVERAGE_OPTIONS.length - 1))
    onChange(LEVERAGE_OPTIONS[index])
  }

  // Find current index
  const currentIndex = LEVERAGE_OPTIONS.indexOf(value)
  const sliderValue = (currentIndex / (LEVERAGE_OPTIONS.length - 1)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-term-text-dim uppercase">Leverage</label>
        <span className="text-sm font-bold text-term-green term-glow">{value}x</span>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderValue}
          onChange={handleSliderChange}
          className="w-full h-1 appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #00ff41 0%, #00ff41 ${sliderValue}%, #2a2a2a ${sliderValue}%, #2a2a2a 100%)`,
          }}
        />

        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {LEVERAGE_OPTIONS.filter((_, i) => i % 2 === 0 || i === LEVERAGE_OPTIONS.length - 1).map((lev) => (
            <button
              key={lev}
              onClick={() => onChange(lev)}
              className={`text-xs transition-colors ${
                value === lev ? 'text-term-green font-medium' : 'text-term-text-dim hover:text-term-text'
              }`}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-1 mt-2">
        {[1, 5, 10, 15, 20, 25].map((lev) => (
          <button
            key={lev}
            onClick={() => onChange(lev)}
            className={`flex-1 py-1 text-xs font-medium transition-colors ${
              value === lev
                ? 'bg-term-green/20 text-term-green border border-term-green'
                : 'bg-term-gray text-term-text-dim hover:text-term-text border border-term-border hover:border-term-green/50'
            }`}
          >
            {lev}x
          </button>
        ))}
      </div>
    </div>
  )
}
