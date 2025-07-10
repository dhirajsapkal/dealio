"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "duration-300 ease-out",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Perfect centering
          "fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2",
          // Responsive sizing
          "w-[95vw] max-w-md mx-auto",      // Mobile: 95% width, max 384px
          "sm:w-[85vw] sm:max-w-lg",       // Tablet: 85% width, max 512px  
          "md:w-[75vw] md:max-w-xl",       // Desktop: 75% width, max 576px
          "lg:w-[60vw] lg:max-w-2xl",      // Large: 60% width, max 672px
          // Responsive height - fixed on mobile, viewport-based on larger screens
          "max-h-[600px] sm:max-h-[calc(100vh-2rem)] overflow-y-auto",  // Fixed height on mobile, viewport-based on sm+
          "p-4 sm:p-6",                    // Responsive padding
          "m-4",                           // Margin for safety on small screens
          // Visual styling
          "bg-white rounded-xl border shadow-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          className
        )}
        {...props}
      >
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="relative"
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className={cn(
                "absolute top-0 right-0 rounded-md opacity-70 ring-offset-white transition-all",
                "hover:opacity-100 hover:bg-gray-100 focus:ring-2 focus:ring-teal-500",
                "focus:ring-offset-2 focus:outline-none disabled:pointer-events-none",
                "p-1.5 sm:p-2", // Responsive padding for touch targets
                "-top-2 -right-2 sm:-top-3 sm:-right-3" // Position outside content
              )}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ 
  className, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        "mb-4 sm:mb-6", // Responsive bottom margin
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ 
  className, 
  ...props 
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        "mt-4 sm:mt-6", // Responsive top margin
        "pt-4 border-t border-gray-100", // Visual separator
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-lg sm:text-xl font-semibold text-gray-900 leading-tight",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-gray-600 text-sm sm:text-base leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
