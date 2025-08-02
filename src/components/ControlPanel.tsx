import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, History, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlPanelProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onClearHistory: () => void
  historyCount: number
  lastAlertTime?: Date
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  onClearHistory,
  historyCount,
  lastAlertTime
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Data Collection Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={isRecording ? onStopRecording : onStartRecording}
            variant={isRecording ? "outline" : "default"}
            className="flex-1"
          >
            {isRecording ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          <Button
            onClick={onClearHistory}
            variant="outline"
            disabled={historyCount === 0}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
        
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Data points:</span>
            <Badge variant="secondary">{historyCount}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge className={cn(
              isRecording ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
            )}>
              {isRecording ? "Active" : "Paused"}
            </Badge>
          </div>
          
          {lastAlertTime && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last alert:</span>
              <div className="flex items-center gap-1">
                <Bell className="w-3 h-3 text-warning" />
                <span className="text-xs">{lastAlertTime.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}