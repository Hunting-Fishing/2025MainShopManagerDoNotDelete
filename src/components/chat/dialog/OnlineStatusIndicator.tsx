
import React from 'react';
import { cn } from '@/lib/utils';

interface OnlineStatusIndicatorProps {
  status: 'online' | 'away' | 'do_not_disturb' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withPing?: boolean;
}

export const OnlineStatusIndicator: React.FC<OnlineStatusIndicatorProps> = ({ 
  status, 
  size = 'md',
  className,
  withPing = false
}) => {
  const sizeClass = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const statusClass = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    do_not_disturb: 'bg-red-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className="relative">
      <div 
        className={cn(
          'rounded-full', 
          sizeClass[size], 
          statusClass[status],
          withPing && status === 'online' ? 'animate-pulse' : '',
          className
        )}
      />
      {withPing && status === 'online' && (
        <div 
          className={cn(
            'absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping',
            sizeClass[size]
          )}
        />
      )}
    </div>
  );
};
