
import { useState } from "react";
import { InventoryItemExtended } from "@/types/inventory";

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
          serialNumbers: [], // Changed from string to string[] to fix the error
          itemCondition: ""
        }
  );

  // Handle form field changes
  const handleChange = (field: keyof Omit<InventoryItemExtended, "id">, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updated_at: new Date().toISOString()
    }));
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
      serialNumbers: [], // Changed from string to string[]
      itemCondition: ""
    });
  };

  return { formData, handleChange, resetForm };
}
