import * as React from "react"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { toast as originalToast } from "@/hooks/use-toast"

type ToastType = "success" | "error" | "warning" | "info"

interface EnhancedToastProps {
  title: string
  description?: string
  type: ToastType
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: "border-green-200 bg-green-50/95 text-green-800",
  error: "border-red-200 bg-red-50/95 text-red-800", 
  warning: "border-amber-200 bg-amber-50/95 text-amber-800",
  info: "border-blue-200 bg-blue-50/95 text-blue-800",
}

export const enhancedToast = ({ title, description, type }: EnhancedToastProps) => {
  const Icon = toastIcons[type]
  
  return originalToast({
    title,
    description: (
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-1 ${
          type === 'success' ? 'bg-green-100' :
          type === 'error' ? 'bg-red-100' :
          type === 'warning' ? 'bg-amber-100' :
          'bg-blue-100'
        }`}>
          <Icon className={`h-5 w-5 ${
            type === 'success' ? 'text-green-600' :
            type === 'error' ? 'text-red-600' :
            type === 'warning' ? 'text-amber-600' :
            'text-blue-600'
          }`} />
        </div>
        <span>{description}</span>
      </div>
    ),
    className: `${toastStyles[type]} animate-[fadeInScale_0.5s_ease-out]`,
  })
}

// Convenience methods
export const successToast = (title: string, description?: string) =>
  enhancedToast({ title, description, type: "success" })

export const errorToast = (title: string, description?: string) =>
  enhancedToast({ title, description, type: "error" })

export const warningToast = (title: string, description?: string) =>
  enhancedToast({ title, description, type: "warning" })

export const infoToast = (title: string, description?: string) =>
  enhancedToast({ title, description, type: "info" })