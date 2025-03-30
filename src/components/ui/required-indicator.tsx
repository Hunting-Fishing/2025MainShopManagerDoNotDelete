
import React from "react";
import { cn } from "@/lib/utils";

interface RequiredIndicatorProps {
  className?: string;
}

export const RequiredIndicator: React.FC<RequiredIndicatorProps> = ({ className }) => {
  return (
    <span 
      className={cn(
        "text-destructive ml-1 font-medium text-sm", 
        className
      )}
      aria-hidden="true"
    >
      *
    </span>
  );
};
