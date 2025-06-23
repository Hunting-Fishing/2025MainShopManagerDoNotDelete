
import { toast } from 'sonner';

export interface PartsFormError {
  field: string;
  message: string;
}

export class PartsFormValidator {
  static validatePartForm(formData: any): PartsFormError[] {
    const errors: PartsFormError[] = [];

    // Required field validations
    if (!formData.name?.trim()) {
      errors.push({ field: 'name', message: 'Part name is required' });
    }

    if (!formData.part_number?.trim()) {
      errors.push({ field: 'part_number', message: 'Part number is required' });
    }

    if (!formData.part_type) {
      errors.push({ field: 'part_type', message: 'Part type is required' });
    }

    // Customer price is required for database
    const customerPrice = formData.unit_price || formData.customerPrice;
    if (!customerPrice || customerPrice < 0) {
      errors.push({ field: 'unit_price', message: 'Customer price is required and must be non-negative' });
    }

    // Numeric validations
    if (!formData.quantity || formData.quantity <= 0) {
      errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
    }

    if (formData.supplierCost && formData.supplierCost < 0) {
      errors.push({ field: 'supplierCost', message: 'Supplier cost cannot be negative' });
    }

    if (formData.retailPrice && formData.retailPrice < 0) {
      errors.push({ field: 'retailPrice', message: 'Retail price cannot be negative' });
    }

    // Business logic validations
    if (formData.part_number && formData.part_number.length < 3) {
      errors.push({ field: 'part_number', message: 'Part number must be at least 3 characters' });
    }

    if (formData.name && formData.name.length < 2) {
      errors.push({ field: 'name', message: 'Part name must be at least 2 characters' });
    }

    return errors;
  }

  static handleApiError(error: unknown): string {
    console.error('Parts API Error:', error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('duplicate')) {
        return 'A part with this number already exists for this work order';
      }
      
      if (error.message.includes('foreign key')) {
        return 'Invalid work order or job line reference';
      }
      
      if (error.message.includes('constraint')) {
        return 'Data validation failed. Please check your input values';
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return 'Network error. Please check your connection and try again';
      }

      // Handle database field errors
      if (error.message.includes('customer_price')) {
        return 'Customer price is required and must be a valid number';
      }

      if (error.message.includes('part_name')) {
        return 'Part name is required';
      }

      if (error.message.includes('part_type')) {
        return 'Part type is required';
      }

      return error.message;
    }

    return 'An unexpected error occurred while processing the part';
  }

  static showErrorToast(message: string) {
    toast.error(message, {
      duration: 5000,
      position: 'top-right'
    });
  }

  static showSuccessToast(message: string) {
    toast.success(message, {
      duration: 3000,
      position: 'top-right'
    });
  }

  static showValidationErrors(errors: PartsFormError[]) {
    const errorMessage = errors.length === 1 
      ? errors[0].message 
      : `Please fix ${errors.length} validation errors`;
    
    this.showErrorToast(errorMessage);
  }
}
