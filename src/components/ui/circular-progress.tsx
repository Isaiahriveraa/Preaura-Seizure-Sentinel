import * as React from "react"
import { cn } from "@/lib/utils"

interface CircularProgressProps {
  value: number
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "warning" | "danger" | "success"
  showValue?: boolean
  label?: string
}

const sizeMap = {
  sm: { radius: 30, strokeWidth: 4, fontSize: "text-sm" },
  md: { radius: 45, strokeWidth: 6, fontSize: "text-base" },
  lg: { radius: 60, strokeWidth: 8, fontSize: "text-lg" },
  xl: { radius: 80, strokeWidth: 10, fontSize: "text-xl" }
}

const variantMap = {
  default: "stroke-primary",
  warning: "stroke-warning",
  danger: "stroke-danger", 
  success: "stroke-success"
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = "md",
  variant = "default",
  showValue = true,
  label
}) => {
  const { radius, strokeWidth, fontSize } = sizeMap[size]
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="currentColor"
          className="text-muted"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke="currentColor"
          className={cn(variantMap[variant], "transition-all duration-500 ease-in-out")}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className={cn("font-bold tabular-nums", fontSize)}>
            {Math.round(value)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        )}
      </div>
    </div>
  )
}