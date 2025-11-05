import React from 'react'
import { shadows, transitions } from '@/constants/designSystem'

export interface SegmentedControlOption<T = string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T = string> {
  options: SegmentedControlOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  className?: string
}

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className = '',
}: SegmentedControlProps<T>) => {
  const selectedIndex = options.findIndex((opt) => opt.value === value)

  // Size variants
  const sizeClasses = {
    sm: 'h-8 text-xs px-2',
    md: 'h-10 text-sm px-3',
    lg: 'h-12 text-base px-4',
  }

  return (
    <div
      className={`relative inline-flex items-center gap-0.5 p-1 bg-neutral-100 rounded-lg ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      style={{
        boxShadow: shadows.inner,
      }}
    >
      {options.map((option, index) => {
        const isSelected = option.value === value
        const isFirst = index === 0
        const isLast = index === options.length - 1

        return (
          <button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            className={`
              relative flex items-center justify-center gap-2
              font-medium transition-all
              ${sizeClasses[size]}
              ${fullWidth ? 'flex-1' : ''}
              ${
                isSelected
                  ? 'text-neutral-900 bg-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }
              ${isFirst ? 'rounded-l-md' : ''}
              ${isLast ? 'rounded-r-md' : ''}
              ${!isFirst && !isLast ? 'rounded-md' : ''}
            `}
            style={{
              transition: `all ${transitions.fast}`,
              ...(isSelected
                ? {
                    boxShadow: shadows.sm,
                  }
                : {}),
            }}
            aria-pressed={isSelected}
            role="radio"
          >
            {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
            <span className="flex-shrink-0">{option.label}</span>

            {/* Smooth transition indicator */}
            {isSelected && (
              <div
                className="absolute inset-0 bg-white rounded-md -z-10"
                style={{
                  transition: `all ${transitions.base}`,
                  boxShadow: shadows.sm,
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

// Preset for Month/Year view toggle
interface ViewToggleProps {
  value: 'monthly' | 'yearly'
  onChange: (value: 'monthly' | 'yearly') => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange, size = 'md', className }) => {
  const options: SegmentedControlOption<'monthly' | 'yearly'>[] = [
    { value: 'monthly', label: 'Mensal' },
    { value: 'yearly', label: 'Anual' },
  ]

  return (
    <SegmentedControl
      options={options}
      value={value}
      onChange={onChange}
      size={size}
      className={className}
    />
  )
}

export default SegmentedControl
