
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JOB_LINE_STATUSES, WORK_ORDER_PART_STATUSES } from '@/types/jobLine';

interface StatusSelectorProps {
  currentStatus: string;
  type: 'jobLine' | 'part';
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
}

export function StatusSelector({ currentStatus, type, onStatusChange, disabled = false }: StatusSelectorProps) {
  const statuses = type === 'jobLine' ? JOB_LINE_STATUSES : WORK_ORDER_PART_STATUSES;
  
  const formatStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <Select value={currentStatus} onValueChange={onStatusChange} disabled={disabled}>
      <SelectTrigger className="w-32 bg-white border-slate-300 text-slate-900">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent className="bg-white border-slate-200 shadow-lg">
        {statuses.map((status) => (
          <SelectItem key={status} value={status} className="hover:bg-slate-50 focus:bg-slate-100 text-slate-900">
            {formatStatusLabel(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
