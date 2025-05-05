
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
    
    // Additional fees
    coreCharge: 0,
    environmentalFee: 0,
    freightFee: 0,
    otherFee: 0,
    otherFeeDescription: "",
    
    // New fields from the UI
    partNumber: "",
    manufacturer: "",
    cost: 0,
    marginMarkup: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    specialTax: 0,
    onOrder: 0,
    onHold: 0,
    minimumOrder: 0,
    maximumOrder: 0,
    totalQtySold: 0,
    dateBought: "",
    dateLast: "",
    serialNumbers: "",
    itemCondition: "New",
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
    if (
      name === "quantity" || name === "reorderPoint" || name === "unitPrice" || 
      name === "coreCharge" || name === "environmentalFee" || name === "freightFee" || 
      name === "otherFee" || name === "cost" || name === "marginMarkup" || 
      name === "retailPrice" || name === "wholesalePrice" || name === "specialTax" || 
      name === "onOrder" || name === "onHold" || name === "minimumOrder" || 
      name === "maximumOrder" || name === "totalQtySold"
    ) {
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
  
  // Add a separate handler for textarea fields
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
  
  // Handle radio button changes
  const handleRadioChange = (name: string, value: string) => {
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
    handleTextAreaChange,
    handleSelectChange,
    handleRadioChange,
  };
}
