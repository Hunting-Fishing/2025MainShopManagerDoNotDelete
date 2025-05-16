
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";

// Interface for form errors
interface FormErrors {
  name?: string;
  sku?: string;
  quantity?: string;
  unit_price?: string;
  category?: string;
  supplier?: string;
  reorder_point?: string;
}

export function useInventoryForm(initialData?: InventoryItemExtended) {
  // Initialize form data
  const [formData, setFormData] = useState<Omit<InventoryItemExtended, "id">>(
    initialData
      ? { ...initialData }
      : {
          name: "",
          sku: "",
          quantity: 0,
          unit_price: 0,
          reorder_point: 10,
          category: "",
          supplier: "",
          location: "",
          status: "In Stock",
          description: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Include additional fields
          partNumber: "",
          barcode: "",
          subcategory: "",
          manufacturer: "",
          vehicleCompatibility: "",
          onHold: 0,
          onOrder: 0,
          minimumOrder: 0,
          maximumOrder: 0,
          cost: 0,
          marginMarkup: 0,
          retailPrice: 0,
          wholesalePrice: 0,
          specialTax: 0,
          coreCharge: 0,
          environmentalFee: 0,
          freightFee: 0,
          otherFee: 0,
          otherFeeDescription: "",
          totalQtySold: 0,
          dateBought: "",
          dateLast: "",
          serialNumbers: [], 
          itemCondition: "",
          warrantyPeriod: "",
          notes: ""
        }
  );

  // Form validation errors
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Mock categories and suppliers for demo
  const categories = ["Electronics", "Automotive", "Tools", "Office Supplies"];
  const suppliers = ["Acme Corp", "Tech Distributors", "Auto Parts Inc", "Office Depot"];

  // Handle form field changes
  const handleChange = (field: keyof Omit<InventoryItemExtended, "id">, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date().toISOString()
    }));
  };

  // Handle input change events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof Omit<InventoryItemExtended, "id">;
    
    // Convert to appropriate type
    if (type === 'number') {
      handleChange(fieldName, Number(value));
    } else {
      handleChange(fieldName, value);
    }
  };

  // Handle textarea change events
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof Omit<InventoryItemExtended, "id">, value);
  };

  // Handle select change events
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof Omit<InventoryItemExtended, "id">, value);
  };

  // Handle radio change events
  const handleRadioChange = (name: string, value: string) => {
    handleChange(name as keyof Omit<InventoryItemExtended, "id">, value);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      quantity: 0,
      unit_price: 0,
      reorder_point: 10,
      category: "",
      supplier: "",
      location: "",
      status: "In Stock",
      description: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Include additional fields
      partNumber: "",
      barcode: "",
      subcategory: "",
      manufacturer: "",
      vehicleCompatibility: "",
      onHold: 0,
      onOrder: 0,
      minimumOrder: 0,
      maximumOrder: 0,
      cost: 0,
      marginMarkup: 0,
      retailPrice: 0,
      wholesalePrice: 0,
      specialTax: 0,
      coreCharge: 0,
      environmentalFee: 0,
      freightFee: 0,
      otherFee: 0,
      otherFeeDescription: "",
      totalQtySold: 0,
      dateBought: "",
      dateLast: "",
      serialNumbers: [],
      itemCondition: "",
      warrantyPeriod: "",
      notes: ""
    });
    setFormErrors({});
  };

  // Validate the form
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Basic validation
    if (!formData.name) errors.name = "Name is required";
    if (!formData.sku) errors.sku = "SKU is required";
    if (formData.quantity < 0) errors.quantity = "Quantity cannot be negative";
    if (formData.unit_price < 0) errors.unit_price = "Price cannot be negative";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.supplier) errors.supplier = "Supplier is required";
    if (formData.reorder_point < 0) errors.reorder_point = "Reorder point cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  return { 
    formData, 
    handleChange, 
    handleInputChange,
    handleTextAreaChange,
    handleSelectChange,
    handleRadioChange,
    resetForm,
    validateForm,
    formErrors,
    categories,
    suppliers
  };
}
