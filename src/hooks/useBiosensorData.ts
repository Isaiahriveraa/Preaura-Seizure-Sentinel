import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface BiosensorReading {
  timestamp: number
  heartRate: number
  skinTemp: number
  eda: number // Electrodermal Activity
  seizureRisk: number
}

interface BiosensorHook {
  currentReading: BiosensorReading
  history: BiosensorReading[]
  isRecording: boolean
  startRecording: () => void
  stopRecording: () => void
  clearHistory: () => void
  saveToDatabase: (reading: BiosensorReading) => Promise<void>
  saveSeizureEvent: (risk: number) => Promise<void>
}

// Mock data generation with realistic patterns
const generateReading = (isPreSeizure = false): Omit<BiosensorReading, 'seizureRisk'> => {
  const baseTime = Date.now()
  
  // Normal ranges
  let heartRate = 70 + Math.sin(baseTime / 10000) * 10 + Math.random() * 6 - 3
  let skinTemp = 36.5 + Math.sin(baseTime / 20000) * 0.3 + Math.random() * 0.2 - 0.1
  let eda = 2 + Math.sin(baseTime / 15000) * 0.5 + Math.random() * 0.3 - 0.15

  // Pre-seizure patterns (for simulation)
  if (isPreSeizure) {
    heartRate += 15 + Math.random() * 10 // Elevated heart rate
    skinTemp -= 0.3 + Math.random() * 0.2 // Drop in temperature
    eda += 1.5 + Math.random() * 0.8 // Increased skin conductance
  }

  return {
    timestamp: baseTime,
    heartRate: Math.max(50, Math.min(150, heartRate)),
    skinTemp: Math.max(35, Math.min(38, skinTemp)),
    eda: Math.max(0.5, Math.min(6, eda))
  }
}

// Simple ML-like prediction function
const calculateSeizureRisk = (reading: Omit<BiosensorReading, 'seizureRisk'>, history: BiosensorReading[]): number => {
  let risk = 0
  
  // Heart rate risk (elevated)
  if (reading.heartRate > 90) risk += 30
  else if (reading.heartRate > 80) risk += 15
  
  // Temperature risk (low)
  if (reading.skinTemp < 36.2) risk += 25
  else if (reading.skinTemp < 36.3) risk += 10
  
  // EDA risk (high)
  if (reading.eda > 3.5) risk += 35
  else if (reading.eda > 2.8) risk += 20
  
  // Trend analysis (if we have history)
  if (history.length >= 3) {
    const recent = history.slice(-3)
    const avgHR = recent.reduce((sum, r) => sum + r.heartRate, 0) / recent.length
    const hrIncrease = reading.heartRate - avgHR
    
    if (hrIncrease > 10) risk += 20
    else if (hrIncrease > 5) risk += 10
  }
  
  // Add some randomness to simulate model uncertainty
  risk += Math.random() * 15 - 7.5
  
  return Math.max(0, Math.min(100, risk))
}

export const useBiosensorData = (): BiosensorHook => {
  const [currentReading, setCurrentReading] = useState<BiosensorReading>(() => {
    const initial = generateReading()
    return {
      ...initial,
      seizureRisk: 0
    }
  })
  const [history, setHistory] = useState<BiosensorReading[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const saveToDatabase = async (reading: BiosensorReading) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      await supabase.from('biosensor_readings').insert({
        user_id: user.id,
        timestamp: new Date(reading.timestamp).toISOString(),
        heart_rate: reading.heartRate,
        skin_temp: reading.skinTemp,
        eda: reading.eda,
        seizure_risk: reading.seizureRisk
      })
    } catch (error) {
      console.error('Error saving reading to database:', error)
    }
  }

  const saveSeizureEvent = async (risk: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      await supabase.from('seizure_events').insert({
        user_id: user.id,
        timestamp: new Date().toISOString(),
        risk_level: risk,
        alert_triggered: true
      })
    } catch (error) {
      console.error('Error saving seizure event to database:', error)
    }
  }

  const generateNewReading = useCallback(() => {
    // Simulate pre-seizure pattern 5% of the time
    const isPreSeizure = Math.random() < 0.05
    const newReading = generateReading(isPreSeizure)
    const seizureRisk = calculateSeizureRisk(newReading, history)
    
    const completeReading: BiosensorReading = {
      ...newReading,
      seizureRisk
    }
    
    setCurrentReading(completeReading)
    
    if (isRecording) {
      setHistory(prev => [...prev.slice(-99), completeReading]) // Keep last 100 readings
      // Save to database
      setTimeout(() => saveToDatabase(completeReading), 0)
    }
  }, [history, isRecording])

  useEffect(() => {
    if (!isRecording) return

    const interval = setInterval(generateNewReading, 1000) // Update every second
    return () => clearInterval(interval)
  }, [generateNewReading, isRecording])

  const startRecording = useCallback(() => {
    setIsRecording(true)
    generateNewReading()
  }, [generateNewReading])

  const stopRecording = useCallback(() => {
    setIsRecording(false)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    currentReading,
    history,
    isRecording,
    startRecording,
    stopRecording,
    clearHistory,
    saveToDatabase,
    saveSeizureEvent
  }
}