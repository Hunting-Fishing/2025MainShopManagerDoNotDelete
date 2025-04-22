
import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  text,
  size = 'md',
  className,
  withDot = true
}) => {
  const sizeClass = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const statusClass = {
    online: "bg-green-100 text-green-800 border-green-300",
    offline: "bg-gray-100 text-gray-800 border-gray-300",
    away: "bg-amber-100 text-amber-800 border-amber-300",
    busy: "bg-red-100 text-red-800 border-red-300",
    success: "bg-green-100 text-green-800 border-green-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    error: "bg-red-100 text-red-800 border-red-300",
    info: "bg-blue-100 text-blue-800 border-blue-300"
  };

  const dotColor = {
    online: "bg-green-500",
    offline: "bg-gray-500",
    away: "bg-amber-500",
    busy: "bg-red-500",
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500"
  };

  if (!text) {
    // If no text provided, return just the status dot
    return (
      <div 
        className={cn(
          'rounded-full w-2 h-2',
          dotColor[status],
          className
        )}
      />
    );
  }

  return (
    <span 
      className={cn(
        "rounded-full font-medium border inline-flex items-center gap-1.5 transition-all",
        sizeClass[size],
        statusClass[status],
        className
      )}
    >
      {withDot && <span className={cn("w-2 h-2 rounded-full", dotColor[status])} />}
      {text}
    </span>
  );
};
