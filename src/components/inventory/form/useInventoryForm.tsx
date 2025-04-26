
import { useState, useEffect } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { getInventoryStatus } from "@/services/inventory/utils";
import { getInventoryCategories } from "@/services/inventory/categoryService";
import { getInventorySuppliers } from "@/services/inventory/supplierService";
import { useInventoryFormValidation } from "@/hooks/inventory/useInventoryFormValidation";

export function useInventoryForm() {
  const [formData, setFormData] = useState<Omit<InventoryItemExtended, "id">>({
    name: "",
    sku: "",
    category: "",
    supplier: "",
    quantity: 0,
    min_stock_level: 5,
    unit_price: 0,
    location: "",
    status: "In Stock",
    description: "",
    // Add compatible properties
    reorderPoint: 5,
    unitPrice: 0
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const { formErrors, validateForm, clearError } = useInventoryFormValidation();

  // Load categories and suppliers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories from the service
        const categories = await getInventoryCategories();
        setCategories(categories);
        
        // Load suppliers from the service
        const suppliers = await getInventorySuppliers();
        setSuppliers(suppliers);
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields differently
    if (name === "quantity" || name === "min_stock_level" || name === "reorderPoint" || name === "unit_price" || name === "unitPrice") {
      const numValue = value === "" ? 0 : Number(value);
      
      // Update status if quantity or min_stock_level changes
      if (name === "quantity" || name === "min_stock_level" || name === "reorderPoint") {
        const newQuantity = name === "quantity" ? numValue : formData.quantity;
        const newReorderPoint = name === "min_stock_level" ? numValue : 
          (name === "reorderPoint" ? numValue : formData.min_stock_level);
        
        // Create a new object for state update
        const newFormData = { ...formData };
        
        // Update the primary field
        if (name === "quantity") {
          newFormData.quantity = numValue;
        } else if (name === "min_stock_level") {
          newFormData.min_stock_level = numValue;
          newFormData.reorderPoint = numValue; // Keep in sync
        } else if (name === "reorderPoint") {
          newFormData.reorderPoint = numValue;
          newFormData.min_stock_level = numValue; // Keep in sync
        } else if (name === "unit_price") {
          newFormData.unit_price = numValue;
          newFormData.unitPrice = numValue; // Keep in sync
        } else if (name === "unitPrice") {
          newFormData.unitPrice = numValue;
          newFormData.unit_price = numValue; // Keep in sync
        }
        
        // Update status
        newFormData.status = getInventoryStatus(newQuantity, newReorderPoint);
        
        setFormData(newFormData);
      } else {
        // For other numeric fields, just update the value
        setFormData(prev => {
          const updated = { ...prev };
          if (name === "unit_price") {
            updated.unit_price = numValue;
            updated.unitPrice = numValue; // Update both properties
          } else if (name === "unitPrice") {
            updated.unitPrice = numValue;
            updated.unit_price = numValue; // Update both properties
          } else {
            updated[name as keyof typeof updated] = numValue;
          }
          return updated;
        });
      }
    } else {
      // For non-numeric fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field if it exists
    clearError(name);
  };
  
  // Handle select change for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field if it exists
    clearError(name);
  };

  return {
    formData,
    setFormData,
    categories,
    suppliers,
    formErrors,
    validateForm,
    handleChange,
    handleSelectChange,
  };
}
