
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";

export interface FormErrors {
  [key: string]: string | undefined;
  name?: string;
  sku?: string;
  quantity?: string;
  unit_price?: string;
  category?: string;
  supplier?: string;
  reorder_point?: string;
}

export function useInventoryFormValidation() {
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const validateForm = (data: Omit<InventoryItemExtended, "id">) => {
    const errors: FormErrors = {};
    
    // Required fields
    if (!data.name) errors.name = "Name is required";
    if (!data.sku) errors.sku = "SKU is required";
    if (data.quantity < 0) errors.quantity = "Quantity cannot be negative";
    if (data.unit_price < 0) errors.unit_price = "Price cannot be negative";
    if (!data.category) errors.category = "Category is required";
    if (!data.supplier) errors.supplier = "Supplier is required";
    if (data.reorder_point < 0) errors.reorder_point = "Reorder point cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: undefined
      });
    }
  };
  
  return { formErrors, validateForm, clearError };
}
