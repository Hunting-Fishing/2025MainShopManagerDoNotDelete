
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

export function useInventoryFormValidation() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: Omit<InventoryItemExtended, "id">): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (!formData.supplier.trim()) errors.supplier = "Supplier is required";
    
    if (formData.unitPrice < 0) errors.unitPrice = "Price cannot be negative";
    if (formData.quantity < 0) errors.quantity = "Quantity cannot be negative";
    if (formData.reorderPoint < 0) errors.reorderPoint = "Reorder point cannot be negative";
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please check the form for errors"
      });
      return false;
    }
    
    return true;
  };

  const clearError = (fieldName: string) => {
    if (formErrors[fieldName]) {
      setFormErrors({
        ...formErrors,
        [fieldName]: ""
      });
    }
  };

  return {
    formErrors,
    validateForm,
    clearError
  };
}
