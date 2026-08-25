"use client"
import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon, CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const toast = ToastPrimitive.createToastManager()

function ToastProvider({ ...props }: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />
}

function ToastPortal({ ...props }: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal data-slot="toast-portal" {...props} />
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-[120] mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className
      )}
      {...props}
    />
  )
}

const TOAST_ACCENTS: Record<string, string> = {
  success: "#34D399",
  info: "#818CF8",
  warning: "#FBBF24",
  error: "#F87171",
  loading: "#818CF8",
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  const type = (props as any).toast?.type as string | undefined
  const accent = type ? TOAST_ACCENTS[type] : undefined

  return (
    <ToastPrimitive.Root
      data-slot="toast"
      style={{
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
      className={cn(
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom overflow-hidden rounded-2xl border border-gray-100 bg-white text-gray-900 shadow-[0_16px_40px_rgba(15,23,42,0.14)] will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className
      )}
      {...props}
    />
  )
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn(
        "relative flex h-full items-start gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold text-gray-900 leading-snug", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("mt-0.5 text-xs text-gray-500 leading-snug", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: ToastPrimitive.Action.Props) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      render={render}
      className={cn("shrink-0 cursor-pointer", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label="Close toast"
      render={render}
      className={cn(
        "relative shrink-0 rounded-lg text-gray-400 transition cursor-pointer after:absolute after:-inset-2 after:content-[''] hover:bg-gray-100 hover:text-gray-700",
        className
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" size={15} />}
    </ToastPrimitive.Close>
  )
}

const ICON_CONFIG: Record<string, { icon: React.ReactNode; gradient: string }> = {
  success: {
    icon: <CircleCheckIcon aria-hidden="true" size={16} />,
    gradient: "from-[#10B981] to-[#34D399]",
  },
  info: {
    icon: <InfoIcon aria-hidden="true" size={16} />,
    gradient: "from-[#4338CA] to-[#6366F1]",
  },
  warning: {
    icon: <TriangleAlertIcon aria-hidden="true" size={16} />,
    gradient: "from-[#D97706] to-[#FBBF24]",
  },
  error: {
    icon: <OctagonXIcon aria-hidden="true" size={16} />,
    gradient: "from-[#DC2626] to-[#F87171]",
  },
  loading: {
    icon: <Loader2Icon className="animate-spin" aria-hidden="true" size={16} />,
    gradient: "from-[#4338CA] to-[#818CF8]",
  },
}

function ToastIcon({ type }: { type: string | undefined }) {
  const entry = type ? ICON_CONFIG[type] : undefined
  if (!entry) return null

  return (
    <span
      data-slot="toast-icon"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
        entry.gradient,
        "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
      )}
    >
      {entry.icon}
    </span>
  )
}

// Thin animated progress bar along the bottom edge, mirroring the toast's own auto-dismiss timing
function ToastProgress({ accent }: { accent?: string }) {
  if (!accent) return null
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-black/5">
      <div
        className="h-full origin-left"
        style={{
          backgroundColor: accent,
          animation: "toastProgress 5s linear forwards",
        }}
      />
    </div>
  )
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()
  return toasts.map((toastItem) => {
    const accent = toastItem.type ? TOAST_ACCENTS[toastItem.type] : undefined
    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent>
          <ToastIcon type={toastItem.type} />
          <div className="flex min-w-0 flex-1 flex-col">
            <ToastTitle />
            <ToastDescription />
          </div>
          <ToastAction />
          <ToastClose />
        </ToastContent>
        <ToastProgress accent={accent} />
      </Toast>
    )
  })
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}

const createToastManager = ToastPrimitive.createToastManager
const useToastManager = ToastPrimitive.useToastManager

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
}