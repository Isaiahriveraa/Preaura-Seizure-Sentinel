import { useState } from "react"
import { useBiosensorData } from "@/hooks/useBiosensorData"
import { RiskIndicator } from "@/components/RiskIndicator"
import { BiosensorChart } from "@/components/BiosensorChart"
import { ControlPanel } from "@/components/ControlPanel"
import { AlertSystem } from "@/components/AlertSystem"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Brain } from "lucide-react"

const Index = () => {
  const {
    currentReading,
    history,
    isRecording,
    startRecording,
    stopRecording,
    clearHistory
  } = useBiosensorData()

  const [lastAlertTime, setLastAlertTime] = useState<Date>()

  const handleAlert = (timestamp: Date) => {
    setLastAlertTime(timestamp)
    // In a real app, this would trigger notifications, emergency contacts, etc.
    console.log(`🚨 Seizure alert triggered at ${timestamp.toISOString()}`)
  }

  return (
    <div className="bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Brain className="w-8 h-8 text-primary" />
              PreAura
              <span className="text-sm font-normal text-muted-foreground ml-2">
                AI-Powered Seizure Prediction
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Monitoring biosensor data in real-time to predict seizures 5-30 minutes in advance
            </p>
          </CardContent>
        </Card>

        {/* Alert System */}
        <AlertSystem
          riskLevel={currentReading.seizureRisk}
          isRecording={isRecording}
          onAlert={handleAlert}
        />

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Indicator */}
          <div className="lg:col-span-1">
            <RiskIndicator 
              risk={currentReading.seizureRisk} 
              isRecording={isRecording}
            />
          </div>

          {/* Controls */}
          <div className="lg:col-span-2">
            <ControlPanel
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              onClearHistory={clearHistory}
              historyCount={history.length}
              lastAlertTime={lastAlertTime}
            />
          </div>
        </div>

        {/* Biosensor Charts */}
        <BiosensorChart 
          data={history}
          currentReading={currentReading}
        />

        {/* Footer */}
        <Card className="bg-muted/30">
          <CardContent className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              <span>Prototype - Using simulated biosensor data for demonstration</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
