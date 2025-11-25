import { useState } from 'react'

export function Tabs({ tabs, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="w-full">
      {/* Tab headers */}
      <div className="flex border-b border-term-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-term-green'
                : 'text-term-text-dim hover:text-term-text'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 text-xs ${
                  activeTab === tab.id ? 'bg-term-green/20 text-term-green' : 'bg-term-gray text-term-text-dim'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-term-green" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTabData?.content}
      </div>
    </div>
  )
}
