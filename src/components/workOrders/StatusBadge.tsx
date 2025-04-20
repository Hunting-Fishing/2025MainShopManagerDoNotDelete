
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { statusConfig, getStatusIcon } from '@/utils/workOrders/statusManagement';

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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };
  
  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full 
        ${config.color} 
        ${sizeClasses[size]} 
        shadow-sm hover:shadow-md transition-all
        ${className}
      `}
    >
      {showIcon && <StatusIcon className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'} mr-1.5`} />}
      {config.label}
    </span>
  );
}
