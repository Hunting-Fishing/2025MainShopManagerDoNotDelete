
import React from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { JobLineForm } from './JobLineForm';

export interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
  jobLine?: WorkOrderJobLine;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel,
  jobLine
}: ServiceBasedJobLineFormProps) {
  return (
    <JobLineForm
      workOrderId={workOrderId}
      jobLine={jobLine}
      onSave={onSave}
      onCancel={onCancel}
      isEditing={!!jobLine}
    />
  );
}
