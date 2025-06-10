
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency as formatCurrencyUtil } from '@/utils/formatters';
import { WorkOrderJobLine } from '@/types/jobLine';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export formatCurrency for backward compatibility
export const formatCurrency = formatCurrencyUtil;

// Job line calculation utilities
export function calculateTotalJobLineAmount(jobLine: WorkOrderJobLine): number {
  if (!jobLine.estimatedHours || !jobLine.laborRate) {
    return jobLine.totalAmount || 0;
  }
  return jobLine.estimatedHours * jobLine.laborRate;
}

export function calculateTotalEstimatedHours(jobLines: WorkOrderJobLine[]): number {
  return jobLines.reduce((total, jobLine) => total + (jobLine.estimatedHours || 0), 0);
}

export function calculateTotalPartsCost(jobLines: WorkOrderJobLine[]): number {
  return jobLines.reduce((total, jobLine) => {
    if (!jobLine.parts) return total;
    return total + jobLine.parts.reduce((partTotal, part) => 
      partTotal + (part.supplierCost * part.quantity), 0
    );
  }, 0);
}
