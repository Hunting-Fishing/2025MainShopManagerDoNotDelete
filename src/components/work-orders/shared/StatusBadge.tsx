
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { jobLineStatusMap, partStatusMap } from '@/types/jobLine';

interface StatusBadgeProps {
  status: string;
  type: 'jobLine' | 'part';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const statusMap = type === 'jobLine' ? jobLineStatusMap : partStatusMap;
  const statusInfo = statusMap[status] || { label: status, classes: 'bg-gray-100 text-gray-800' };
  
  return (
    <Badge 
      variant="secondary" 
      className={`${statusInfo.classes} text-xs font-medium`}
    >
      {statusInfo.label}
    </Badge>
  );
}
