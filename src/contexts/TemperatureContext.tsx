import React, { createContext, useContext, useState, ReactNode } from 'react'

// Define the temperature units
export type TemperatureUnit = 'celsius' | 'fahrenheit'

// Define the context interface
interface TemperatureContextType {
  unit: TemperatureUnit
  toggleUnit: () => void
  convertTemperature: (temp: number, fromUnit?: TemperatureUnit) => number
  getUnitSymbol: () => string
}

// Create the context with undefined default (we'll handle this in useTemperature)
const TemperatureContext = createContext<TemperatureContextType | undefined>(undefined)

// Custom hook to use the temperature context
export const useTemperature = () => {
  const context = useContext(TemperatureContext)
  if (context === undefined) {
    throw new Error('useTemperature must be used within a TemperatureProvider')
  }
  return context
}

// Provider component props
interface TemperatureProviderProps {
  children: ReactNode
}

// Temperature conversion functions
const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32
}

const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9
}

// Provider component
export const TemperatureProvider: React.FC<TemperatureProviderProps> = ({ children }) => {
  // State to track current unit (default to Celsius)
  const [unit, setUnit] = useState<TemperatureUnit>('celsius')

  // Function to toggle between units
  const toggleUnit = () => {
    setUnit(prevUnit => prevUnit === 'celsius' ? 'fahrenheit' : 'celsius')
  }

  // Function to convert temperature based on current unit
  const convertTemperature = (temp: number, fromUnit: TemperatureUnit = 'celsius'): number => {
    // If the fromUnit is the same as current unit, no conversion needed
    if (fromUnit === unit) {
      return temp
    }

    // Convert based on the current unit setting
    if (unit === 'fahrenheit' && fromUnit === 'celsius') {
      return celsiusToFahrenheit(temp)
    } else if (unit === 'celsius' && fromUnit === 'fahrenheit') {
      return fahrenheitToCelsius(temp)
    }

    return temp // No conversion needed
  }

  // Function to get the unit symbol
  const getUnitSymbol = (): string => {
    return unit === 'celsius' ? '°C' : '°F'
  }

  // Context value object
  const value: TemperatureContextType = {
    unit,
    toggleUnit,
    convertTemperature,
    getUnitSymbol
  }

  return (
    <TemperatureContext.Provider value={value}>
      {children}
    </TemperatureContext.Provider>
  )
}

// Helper functions that can be used outside of components
export const convertCelsiusToFahrenheit = celsiusToFahrenheit
export const convertFahrenheitToCelsius = fahrenheitToCelsius
