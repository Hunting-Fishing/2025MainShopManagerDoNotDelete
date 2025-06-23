
import { toast } from 'sonner';

export class PartsFormValidator {
  static validatePartData(data: any): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Part name is required');
    }

    if (!data.part_number || data.part_number.trim() === '') {
      errors.push('Part number is required');
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push('Quantity must be greater than 0');
    }

    if (data.unit_price < 0) {
      errors.push('Unit price cannot be negative');
    }

    return errors;
  }

  static handleApiError(error: any): string {
    console.error('API Error:', error);
    
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unexpected error occurred';
  }

  static showSuccessToast(message: string) {
    toast.success(message);
  }

  static showErrorToast(message: string) {
    toast.error(message);
  }

  static showWarningToast(message: string) {
    toast.warning(message);
  }
}
