
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { statusConfig, getStatusIcon } from '@/utils/workOrders/statusManagement';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: WorkOrder['status'];
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className = '' 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const StatusIcon = getStatusIcon(status);
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        'shadow-sm transition-all duration-200',
        'hover:shadow-md hover:scale-102 active:scale-98',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        config.color,
        sizeClasses[size],
        className
      )}
      role="status"
    >
      {showIcon && (
        <StatusIcon className={cn(
          'mr-1.5 transition-transform',
          size === 'sm' ? 'h-3 w-3' : 
          size === 'md' ? 'h-4 w-4' : 
          'h-5 w-5'
        )} />
      )}
      {config.label}
    </span>
  );
}
