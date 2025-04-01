
import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fullWidthOnMobile?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export function ResponsiveContainer({
  children,
  className,
  fullWidthOnMobile = true,
  maxWidth = "xl",
  padding = true,
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    "xs": "max-w-xs",
    "sm": "max-w-sm",
    "md": "max-w-md",
    "lg": "max-w-lg",
    "xl": "max-w-xl",
    "2xl": "max-w-2xl",
    "full": "max-w-full",
  };
  
  return (
    <div
      className={cn(
        "w-full mx-auto",
        fullWidthOnMobile ? "w-full" : "",
        maxWidthClasses[maxWidth],
        padding ? "px-4 md:px-6" : "",
        className
      )}
    >
      {children}
    </div>
  );
}
