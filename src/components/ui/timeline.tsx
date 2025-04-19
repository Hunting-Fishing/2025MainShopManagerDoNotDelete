
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      {children}
    </div>
  )
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex gap-4 relative", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineItem.displayName = "TimelineItem";

export const TimelineLine = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute left-3.5 top-9 -bottom-[5px] w-[1px] bg-slate-200",
      className
    )}
    {...props}
  />
));
TimelineLine.displayName = "TimelineLine";

export interface TimelineIconProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineIcon.displayName = "TimelineIcon";

export const TimelineContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("pt-1", className)}
    {...props}
  />
));
TimelineContainer.displayName = "TimelineContainer";

export interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("ml-4 pb-8", className)}
      {...props}
    >
      {children}
    </div>
  )
);
TimelineContent.displayName = "TimelineContent";
