import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { BiosensorReading } from "@/hooks/useBiosensorData"
import { Heart, Thermometer, Zap } from "lucide-react"
import { useTemperature } from "@/contexts/TemperatureContext"
import { TemperatureToggleCompact } from "./TemperatureToggle"

interface BiosensorChartProps {
  data: BiosensorReading[]
  currentReading: BiosensorReading
}

export const BiosensorChart: React.FC<BiosensorChartProps> = ({ data, currentReading }) => {
  const { convertTemperature, getUnitSymbol } = useTemperature()
  
  // Convert current temperature for display
  const displayTemp = convertTemperature(currentReading.skinTemp, 'celsius')
  
  // Prepare chart data with last 20 readings
  const chartData = data.slice(-20).map((reading, index) => ({
    time: index,
    heartRate: reading.heartRate,
    skinTemp: convertTemperature(reading.skinTemp, 'celsius') * 10, // Scale for better visualization
    eda: reading.eda * 10
  }))

  return (
    <div className="space-y-4">
      {/* Current Readings Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Heart className="w-8 h-8 text-danger mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Heart Rate</p>
              <p className="text-2xl font-bold">{Math.round(currentReading.heartRate)}</p>
              <p className="text-xs text-muted-foreground">BPM</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Thermometer className="w-8 h-8 text-primary mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Skin Temp</p>
                <p className="text-2xl font-bold">{displayTemp.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{getUnitSymbol()}</p>
              </div>
            </div>
            <TemperatureToggleCompact />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Zap className="w-8 h-8 text-warning mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">EDA</p>
              <p className="text-2xl font-bold">{currentReading.eda.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">μS</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signal Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Live Biosensor Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time (seconds ago)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="hsl(var(--danger))" 
                  strokeWidth={2}
                  name="Heart Rate (BPM)"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="skinTemp" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name={`Skin Temp (×10 ${getUnitSymbol()})`}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="eda" 
                  stroke="hsl(var(--warning))" 
                  strokeWidth={2}
                  name="EDA (×10 μS)"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}