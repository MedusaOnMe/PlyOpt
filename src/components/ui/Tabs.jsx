import { useState } from 'react'

export function Tabs({ tabs, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="w-full h-full flex flex-col">
      {/* Tab headers */}
      <div className="flex border-b border-glass-border px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-all duration-200 relative rounded-t-lg ${
              activeTab === tab.id
                ? 'text-accent-purple bg-glass-hover'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-glass-hover/50'
            }`}
          >
            <span className="flex items-center gap-2">
              {tab.icon && (
                <span className={activeTab === tab.id ? 'text-accent-purple' : 'text-text-tertiary'}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-md font-medium ${
                  activeTab === tab.id
                    ? 'bg-accent-purple/20 text-accent-purple'
                    : 'bg-bg-tertiary text-text-tertiary'
                }`}>
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent-purple rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTabData?.content}
      </div>
    </div>
  )
}
