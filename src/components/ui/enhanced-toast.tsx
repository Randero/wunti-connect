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

export const enhancedToast = ({ title, description, type, duration = 3000 }: EnhancedToastProps) => {
  const Icon = toastIcons[type]
  
  const toastId = originalToast({
    title,
    description: (
      <div className="flex items-center gap-4">
        <div className={`relative rounded-full p-3 ${backgroundStyles[type]} animate-[bounce_0.6s_ease-in-out,glow_1.5s_ease-in-out_infinite_alternate]`}>
          <Icon className={`h-7 w-7 ${iconStyles[type]} animate-[pulse_1.2s_ease-in-out_infinite]`} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent animate-[shimmer_2s_ease-in-out_infinite]"></div>
        </div>
        <div className="flex flex-col space-y-1">
          <span className="font-bold text-lg tracking-tight animate-[slideInLeft_0.5s_cubic-bezier(0.16,1,0.3,1)]">{title}</span>
          {description && (
            <span className="text-sm opacity-90 font-medium animate-[slideInLeft_0.6s_cubic-bezier(0.16,1,0.3,1)]">{description}</span>
          )}
        </div>
      </div>
    ),
    className: `${toastStyles[type]} animate-[slideInFromTop_0.6s_cubic-bezier(0.34,1.56,0.64,1),float_3s_ease-in-out_infinite] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border-2 backdrop-blur-md ring-2 ring-white/10 relative overflow-hidden`,
    duration,
  })

  // Ultra-responsive auto-dismiss with visual feedback
  if (typeof window !== 'undefined') {
    let isHovered = false
    let touchTimer: NodeJS.Timeout
    
    const handleInteraction = () => {
      if (toastId && !isHovered) {
        // Add exit animation
        const toastElement = document.querySelector(`[data-toast-id="${toastId.id}"]`)
        if (toastElement) {
          toastElement.classList.add('animate-[slideOutToTop_0.3s_cubic-bezier(0.4,0,1,1)]')
          setTimeout(() => toastId.dismiss(), 300)
        } else {
          toastId.dismiss()
        }
      }
    }

    const handleHover = () => {
      isHovered = true
      clearTimeout(touchTimer)
    }

    const handleLeave = () => {
      isHovered = false
      touchTimer = setTimeout(handleInteraction, 500)
    }
    
    setTimeout(() => {
      const toastElement = document.querySelector('[data-toast-id]')
      if (toastElement) {
        toastElement.addEventListener('mouseenter', handleHover)
        toastElement.addEventListener('mouseleave', handleLeave)
      }
      
      document.addEventListener('click', handleInteraction, { once: true })
      document.addEventListener('touchstart', handleInteraction, { once: true })
      
      // Auto-dismiss after duration with exit animation
      setTimeout(() => {
        if (toastId && !isHovered) {
          const toastEl = document.querySelector(`[data-toast-id="${toastId.id}"]`)
          if (toastEl) {
            toastEl.classList.add('animate-[slideOutToTop_0.4s_cubic-bezier(0.4,0,1,1)]')
            setTimeout(() => toastId.dismiss(), 400)
          }
        }
      }, duration - 500)
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