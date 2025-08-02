import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AlertSystemProps {
  riskLevel: number
  isRecording: boolean
  onAlert?: (timestamp: Date) => void
}

interface AlertLog {
  id: string
  timestamp: Date
  riskLevel: number
  dismissed: boolean
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ 
  riskLevel, 
  isRecording, 
  onAlert 
}) => {
  const [alerts, setAlerts] = useState<AlertLog[]>([])
  const [showActiveAlert, setShowActiveAlert] = useState(false)

  // Alert threshold
  const ALERT_THRESHOLD = 70

  useEffect(() => {
    if (isRecording && riskLevel >= ALERT_THRESHOLD) {
      // Check if we already have a recent alert (within last 30 seconds)
      const recentAlert = alerts.find(alert => 
        !alert.dismissed && 
        Date.now() - alert.timestamp.getTime() < 30000
      )

      if (!recentAlert) {
        const newAlert: AlertLog = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          riskLevel,
          dismissed: false
        }
        
        setAlerts(prev => [...prev, newAlert])
        setShowActiveAlert(true)
        onAlert?.(newAlert.timestamp)
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
          setShowActiveAlert(false)
        }, 10000)
      }
    }
  }, [riskLevel, isRecording, alerts, onAlert])

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ))
    setShowActiveAlert(false)
  }

  const clearAllAlerts = () => {
    setAlerts([])
    setShowActiveAlert(false)
  }

  const activeAlert = alerts.find(alert => !alert.dismissed)

  return (
    <div className="space-y-4">
      {/* Active Alert Banner */}
      {showActiveAlert && activeAlert && (
        <Alert className="border-danger bg-danger/5">
          <AlertTriangle className="h-4 w-4 text-danger" />
          <AlertTitle className="text-danger">High Seizure Risk Detected</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Risk level: {Math.round(activeAlert.riskLevel)}% - Consider safety measures
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(activeAlert.id)}
              className="ml-4 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Alert History */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alert History
            </h4>
            {alerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllAlerts}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts recorded</p>
          ) : (
            <div className="space-y-2">
              {alerts.slice(-5).reverse().map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md text-sm",
                    alert.dismissed 
                      ? "bg-muted/50 text-muted-foreground" 
                      : "bg-danger/10 text-danger"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Risk: {Math.round(alert.riskLevel)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                    {!alert.dismissed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-5 w-5 p-0"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}