import { useState } from 'react'
import { cn } from '../../utils/cn'

const Tabs = ({ defaultValue, value, onValueChange, className, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue)
  const currentValue = value ?? activeTab

  const handleChange = (newValue) => {
    setActiveTab(newValue)
    onValueChange?.(newValue)
  }

  const childrenArray = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      {childrenArray.map((child) => {
        if (!child) return null
        if (child.type === TabsList) {
          return (
            <TabsList key="tabs-list">
              {child.props.children.map((triggerChild) => (
                <TabsTrigger
                  key={triggerChild.props.value}
                  value={triggerChild.props.value}
                  isActive={triggerChild.props.value === currentValue}
                  onClick={() => handleChange(triggerChild.props.value)}
                >
                  {triggerChild.props.children}
                </TabsTrigger>
              ))}
            </TabsList>
          )
        }
        if (child.type === TabsContent && child.props.value === currentValue) {
          return <div key={child.props.value}>{child.props.children}</div>
        }
        return null
      })}
    </div>
  )
}

const TabsList = ({ className, children }) => (
  <div
    className={cn(
      'inline-flex h-auto items-center justify-start rounded-xl bg-slate-100 p-1',
      'w-full overflow-x-auto scrollbar-hide snap-x',
      className
    )}
    role="tablist"
  >
    {children}
  </div>
)

const TabsTrigger = ({ value, isActive, children, ...props }) => (
  <button
    type="button"
    role="tab"
    aria-selected={isActive}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium',
      'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900',
      'snap-start shrink-0 min-h-[44px]',
      isActive
        ? 'bg-white text-slate-900 shadow-sm'
        : 'text-slate-600 hover:text-slate-900'
    )}
    {...props}
  >
    {children}
  </button>
)

const TabsContent = ({ value, children }) => (
  <div role="tabpanel" className="mt-2">
    {children}
  </div>
)

export { Tabs, TabsList, TabsTrigger, TabsContent }