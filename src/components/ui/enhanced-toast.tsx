import * as React from "react"
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { toast as originalToast } from "@/hooks/use-toast"

type ToastType = "success" | "error" | "warning" | "info"

interface EnhancedToastProps {
  title: string
  description?: string
  type: ToastType
  duration?: number
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const toastStyles = {
  success: "border-emerald-300 bg-emerald-50/95 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/95 dark:text-emerald-200",
  error: "border-red-300 bg-red-50/95 text-red-800 dark:border-red-600 dark:bg-red-950/95 dark:text-red-200", 
  warning: "border-amber-300 bg-amber-50/95 text-amber-800 dark:border-amber-600 dark:bg-amber-950/95 dark:text-amber-200",
  info: "border-blue-300 bg-blue-50/95 text-blue-800 dark:border-blue-600 dark:bg-blue-950/95 dark:text-blue-200",
}

const iconStyles = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-blue-600 dark:text-blue-400",
}

const backgroundStyles = {
  success: "bg-emerald-100 dark:bg-emerald-900/30",
  error: "bg-red-100 dark:bg-red-900/30",
  warning: "bg-amber-100 dark:bg-amber-900/30",
  info: "bg-blue-100 dark:bg-blue-900/30",
}

export const enhancedToast = ({ title, description, type, duration = 2000 }: EnhancedToastProps) => {
  const Icon = toastIcons[type]
  
  const toastId = originalToast({
    title,
    description: (
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-2 ${backgroundStyles[type]} animate-bounce`}>
          <Icon className={`h-6 w-6 ${iconStyles[type]} animate-pulse`} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-lg">{title}</span>
          {description && (
            <span className="text-sm opacity-90 mt-1">{description}</span>
          )}
        </div>
      </div>
    ),
    className: `${toastStyles[type]} animate-[slideInFromTop_0.4s_cubic-bezier(0.16,1,0.3,1)] shadow-2xl border-2 backdrop-blur-sm`,
    duration,
  })

  // Auto-dismiss on touch/click
  if (typeof window !== 'undefined') {
    const handleInteraction = () => {
      if (toastId) {
        toastId.dismiss()
      }
    }
    
    setTimeout(() => {
      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
    }, 100)
  }

  return toastId
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