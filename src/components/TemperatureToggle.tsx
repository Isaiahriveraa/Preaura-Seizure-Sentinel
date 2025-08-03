import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Thermometer } from 'lucide-react'
import { useTemperature } from '@/contexts/TemperatureContext'

interface TemperatureToggleProps {
  className?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const TemperatureToggle: React.FC<TemperatureToggleProps> = ({ 
  className = '', 
  showIcon = true,
  size = 'md' 
}) => {
  const { unit, toggleUnit } = useTemperature()

  // Size-based styling
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2', 
    lg: 'text-base gap-3'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`flex items-center ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <Thermometer className={`${iconSizes[size]} text-primary`} />
      )}
      
      {/* Celsius Label */}
      <Label 
        htmlFor="temperature-toggle" 
        className={`cursor-pointer font-medium ${
          unit === 'celsius' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        °C
      </Label>
      
      {/* Toggle Switch */}
      <Switch
        id="temperature-toggle"
        checked={unit === 'fahrenheit'}
        onCheckedChange={toggleUnit}
        className="mx-1"
        aria-label={`Switch to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
      />
      
      {/* Fahrenheit Label */}
      <Label 
        htmlFor="temperature-toggle" 
        className={`cursor-pointer font-medium ${
          unit === 'fahrenheit' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        °F
      </Label>
    </div>
  )
}

// Alternative compact version for tight spaces
export const TemperatureToggleCompact: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { unit, toggleUnit, getUnitSymbol } = useTemperature()

  return (
    <button
      onClick={toggleUnit}
      className={`flex items-center gap-1 px-2 py-1 rounded-md bg-muted hover:bg-muted/80 transition-colors text-xs font-medium ${className}`}
      aria-label={`Currently ${unit}, click to switch to ${unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`}
    >
      <Thermometer className="w-3 h-3" />
      <span>{getUnitSymbol()}</span>
    </button>
  )
}
