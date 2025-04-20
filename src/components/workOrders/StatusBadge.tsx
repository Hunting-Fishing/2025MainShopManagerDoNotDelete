
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
    sm: 'text-xs px-2.5 py-0.5 [&_svg]:size-3',
    md: 'text-sm px-3 py-1 [&_svg]:size-4',
    lg: 'text-base px-4 py-1.5 [&_svg]:size-5'
  };
  
  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        'border-2 transition-all duration-200',
        'shadow-sm hover:shadow-md',
        'transform hover:scale-102 active:scale-98',
        'ring-offset-2 focus:outline-none focus:ring-2',
        config.color,
        sizeClasses[size],
        className
      )}
      role="status"
    >
      {showIcon && (
        <StatusIcon className={cn(
          'mr-1.5 transition-transform',
          'group-hover:rotate-3'
        )} />
      )}
      {config.label}
    </span>
  );
}
