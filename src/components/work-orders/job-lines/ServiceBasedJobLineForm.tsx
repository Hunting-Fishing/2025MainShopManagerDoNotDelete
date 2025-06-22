
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineForm } from './JobLineForm';

export interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
  jobLine?: WorkOrderJobLine;
  mode?: 'service' | 'manual';
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel,
  jobLine,
  mode = 'service'
}: ServiceBasedJobLineFormProps) {
  return (
    <JobLineForm
      workOrderId={workOrderId}
      jobLine={jobLine}
      onSave={onSave}
      onCancel={onCancel}
      isEditing={!!jobLine}
      mode={mode}
    />
  );
}
