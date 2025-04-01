
import * as React from "react"
import { cn } from "@/lib/utils"

type GridColumnCount = 1 | 2 | 3 | 4 | 5 | 6 | 12;

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: GridColumnCount;
    sm?: GridColumnCount;
    md?: GridColumnCount;
    lg?: GridColumnCount;
    xl?: GridColumnCount;
  };
  gap?: "none" | "xs" | "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, md: 2, lg: 3 },
  gap = "md",
}: ResponsiveGridProps) {
  // Grid column mapping
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    12: "grid-cols-12",
  };
  
  // Grid gap mapping
  const gapClasses = {
    "none": "gap-0",
    "xs": "gap-2",
    "sm": "gap-4",
    "md": "gap-6",
    "lg": "gap-8",
  };

  // Responsive columns
  const { default: defaultCols = 1, sm, md, lg, xl } = cols;
  
  const responsiveColClasses = [
    colClasses[defaultCols],                       // Default 
    sm ? `sm:${colClasses[sm]}` : "",             // Small screens
    md ? `md:${colClasses[md]}` : "",             // Medium screens
    lg ? `lg:${colClasses[lg]}` : "",             // Large screens
    xl ? `xl:${colClasses[xl]}` : "",             // Extra large screens
  ].filter(Boolean).join(" ");
  
  return (
    <div
      className={cn(
        "grid",
        responsiveColClasses,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
