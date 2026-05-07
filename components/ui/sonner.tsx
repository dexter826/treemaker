"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast pr-10 bg-background text-foreground font-bold uppercase tracking-widest text-xs border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)]",
          closeButton: "![transform:translateY(-50%)] !top-1/2 !right-4 !left-auto !bg-background !border-2 !border-foreground !rounded-none !opacity-100 !text-foreground hover:!bg-foreground hover:!text-background transition-colors cursor-pointer",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
