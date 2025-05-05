
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
    reorderPoint: 5,
    unitPrice: 0,
    location: "",
    status: "In Stock",
    description: "",
    coreCharge: 0,
    environmentalFee: 0,
    freightFee: 0,
    otherFee: 0,
    otherFeeDescription: "",
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
    if (name === "quantity" || name === "reorderPoint" || name === "unitPrice" || 
        name === "coreCharge" || name === "environmentalFee" || name === "freightFee" || name === "otherFee") {
      const numValue = value === "" ? 0 : Number(value);
      
      // Update status if quantity or reorderPoint changes
      if (name === "quantity" || name === "reorderPoint") {
        const newQuantity = name === "quantity" ? numValue : formData.quantity;
        const newReorderPoint = name === "reorderPoint" ? numValue : formData.reorderPoint;
        
        setFormData({
          ...formData,
          [name]: numValue,
          status: getInventoryStatus(newQuantity, newReorderPoint)
        });
      } else {
        setFormData({
          ...formData,
          [name]: numValue
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error for this field if it exists
    clearError(name);
  };
  
  // Handle select change for dropdown fields
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
    
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
