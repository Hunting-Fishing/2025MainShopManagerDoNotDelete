
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /**
   * Optional size variant of the spinner - "sm", "md", "lg", etc.
   */
  size?: "sm" | "md" | "lg" | string;
  /**
   * Additional class names to apply to the spinner
   */
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-b-2",
    lg: "h-12 w-12 border-b-2",
  };

  const spinnerSize = sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md;

  return (
    <div className="flex justify-center items-center p-4">
      <div className={cn(`animate-spin rounded-full ${spinnerSize} border-primary`, className)}></div>
    </div>
  );
}
