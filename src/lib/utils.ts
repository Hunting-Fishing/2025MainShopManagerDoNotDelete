
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatCurrency as formatCurrencyUtil } from '@/utils/formatters';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export formatCurrency for backward compatibility
export const formatCurrency = formatCurrencyUtil;
