import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '@/integrations/supabase/client'

// Define the temperature units
export type TemperatureUnit = 'celsius' | 'fahrenheit'

// Define the context interface
interface TemperatureContextType {
  unit: TemperatureUnit
  toggleUnit: () => void
  setUnit: (unit: TemperatureUnit) => void
  convertTemperature: (temp: number, fromUnit?: TemperatureUnit) => number
  getUnitSymbol: () => string
  isLoading: boolean
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
  const { user } = useAuth()
  const [unit, setUnitState] = useState<TemperatureUnit>('celsius')
  const [isLoading, setIsLoading] = useState(true)

  // Load user's temperature preference from profile
  useEffect(() => {
    const loadTemperaturePreference = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('temperature_unit')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('Error loading temperature preference:', error)
        } else if (data?.temperature_unit) {
          setUnitState(data.temperature_unit as TemperatureUnit)
        }
      } catch (error) {
        console.error('Error loading temperature preference:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemperaturePreference()
  }, [user])

  // Function to save preference to database
  const saveTemperaturePreference = async (newUnit: TemperatureUnit) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          temperature_unit: newUnit,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving temperature preference:', error)
      }
    } catch (error) {
      console.error('Error saving temperature preference:', error)
    }
  }

  // Function to set temperature unit
  const setUnit = async (newUnit: TemperatureUnit) => {
    setUnitState(newUnit)
    await saveTemperaturePreference(newUnit)
  }

  // Function to toggle between units
  const toggleUnit = async () => {
    const newUnit = unit === 'celsius' ? 'fahrenheit' : 'celsius'
    await setUnit(newUnit)
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
    setUnit,
    convertTemperature,
    getUnitSymbol,
    isLoading
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
