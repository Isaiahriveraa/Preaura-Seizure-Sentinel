import { CircularProgress } from "@/components/ui/circular-progress"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, Shield, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface RiskIndicatorProps {
  risk: number
  isRecording: boolean
}

const getRiskLevel = (risk: number) => {
  if (risk >= 70) return { level: "high", variant: "danger" as const, icon: AlertTriangle, text: "High Risk" }
  if (risk >= 40) return { level: "medium", variant: "warning" as const, icon: Zap, text: "Elevated" }
  return { level: "low", variant: "success" as const, icon: Shield, text: "Normal" }
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ risk, isRecording }) => {
  const { level, variant, icon: Icon, text } = getRiskLevel(risk)
  
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="flex flex-col items-center p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Seizure Risk</h3>
          <p className="text-sm text-muted-foreground">AI Prediction Model</p>
        </div>
        
        <div className="relative">
          <CircularProgress 
            value={risk} 
            size="xl" 
            variant={variant}
            showValue={false}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Icon className={cn(
              "w-8 h-8 mb-2",
              variant === "danger" && "text-danger",
              variant === "warning" && "text-warning", 
              variant === "success" && "text-success"
            )} />
            <span className="text-2xl font-bold tabular-nums">{Math.round(risk)}%</span>
          </div>
        </div>
        
        <div className="text-center">
          <div className={cn(
            "text-sm font-medium px-3 py-1 rounded-full",
            variant === "danger" && "bg-danger/10 text-danger",
            variant === "warning" && "bg-warning/10 text-warning",
            variant === "success" && "bg-success/10 text-success"
          )}>
            {text}
          </div>
          
          <div className="flex items-center justify-center mt-2 text-xs text-muted-foreground">
            <div className={cn(
              "w-2 h-2 rounded-full mr-2",
              isRecording ? "bg-success animate-pulse" : "bg-muted"
            )} />
            {isRecording ? "Recording" : "Paused"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}