import { useState } from "react"
import { useBiosensorData } from "@/hooks/useBiosensorData"
import { RiskIndicator } from "@/components/RiskIndicator"
import { BiosensorChart } from "@/components/BiosensorChart"
import { ControlPanel } from "@/components/ControlPanel"
import { AlertSystem } from "@/components/AlertSystem"
import SeizureSimulation from "@/components/SeizureSimulation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Brain, Zap } from "lucide-react"
import { type SeizureEvent } from "@/data/mockPatients"

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
  const [recordedSeizures, setRecordedSeizures] = useState<SeizureEvent[]>([])

  const handleAlert = (timestamp: Date) => {
    setLastAlertTime(timestamp)
    // In a real app, this would trigger notifications, emergency contacts, etc.
    console.log(`🚨 Seizure alert triggered at ${timestamp.toISOString()}`)
  }

  const handleSeizureRecorded = (seizure: SeizureEvent) => {
    setRecordedSeizures(prev => [seizure, ...prev])
    // In a real app, this would be saved to the database
    console.log('New seizure recorded:', seizure)
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

        {/* Main Dashboard Content */}
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitoring" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Live Monitoring</span>
            </TabsTrigger>
            <TabsTrigger value="seizure-recorder" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Seizure Recorder</span>
            </TabsTrigger>
            <TabsTrigger value="recent-events" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Recent Events ({recordedSeizures.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Live Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
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
          </TabsContent>

          {/* Seizure Recorder Tab */}
          <TabsContent value="seizure-recorder">
            <SeizureSimulation onSeizureRecorded={handleSeizureRecorded} />
          </TabsContent>

          {/* Recent Events Tab */}
          <TabsContent value="recent-events">
            <Card>
              <CardHeader>
                <CardTitle>Recently Recorded Seizures</CardTitle>
              </CardHeader>
              <CardContent>
                {recordedSeizures.length > 0 ? (
                  <div className="space-y-4">
                    {recordedSeizures.map((seizure) => (
                      <div key={seizure.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">
                              {new Date(`${seizure.date}T${seizure.time}`).toLocaleString()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Duration: {seizure.duration}s • Type: {seizure.type} • Severity: {seizure.severity}
                            </p>
                            {seizure.notes && (
                              <p className="text-sm text-gray-500 mt-1">{seizure.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-blue-600 font-medium">EEG Available</div>
                            <div className="text-xs text-gray-500">View in Seizure History</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recorded seizures</h3>
                    <p className="text-gray-500">Use the Seizure Recorder tab to record and analyze seizure events</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
