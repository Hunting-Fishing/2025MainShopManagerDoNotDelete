
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EnhancedLoadingStateProps {
  className?: string;
  type?: "line" | "card" | "table" | "form";
  count?: number;
}

export const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  className,
  type = "line",
  count = 1,
}) => {
  const renderLoadingElement = (index: number) => {
    switch (type) {
      case "card":
        return (
          <Card key={index} className={cn("w-full", className)}>
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardContent>
          </Card>
        );
      case "table":
        return (
          <div key={index} className={cn("w-full border rounded-md p-4", className)}>
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-8 w-24" />
            </div>
            {Array(4).fill(0).map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-between py-2">
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-4 w-1/5" />
                <Skeleton className="h-4 w-1/5" />
                <Skeleton className="h-4 w-1/6" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        );
      case "form":
        return (
          <div key={index} className={cn("space-y-6 w-full", className)}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/5" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-1/4" />
          </div>
        );
      default:
        return <Skeleton key={index} className={cn("h-8 w-full", className)} />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {Array(count).fill(0).map((_, index) => renderLoadingElement(index))}
    </div>
  );
};
