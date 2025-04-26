
import { useState } from 'react';
import { InventoryItemExtended } from '@/types/inventory';

export function useInventoryFormValidation() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearError = (fieldName: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const validateForm = (data: Omit<InventoryItemExtended, "id">) => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Name is required';
    }

    if (!data.sku || data.sku.trim() === '') {
      errors.sku = 'SKU is required';
    }

    if (!data.category || data.category.trim() === '') {
      errors.category = 'Category is required';
    }

    if (!data.supplier || data.supplier.trim() === '') {
      errors.supplier = 'Supplier is required';
    }

    if (data.quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    // Use either min_stock_level or reorderPoint
    if ((data.min_stock_level || data.reorderPoint) < 0) {
      errors.min_stock_level = 'Reorder point cannot be negative';
      errors.reorderPoint = 'Reorder point cannot be negative';
    }

    // Use either unit_price or unitPrice
    if ((data.unit_price || data.unitPrice) < 0) {
      errors.unit_price = 'Price cannot be negative';
      errors.unitPrice = 'Price cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { formErrors, validateForm, clearError };
}
