
import React, { useState, useEffect } from "react";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormProps } from "./InventoryFormProps";
import { InventoryFormStatus } from "./InventoryFormStatus";
import { InventoryFormSelect, SelectOption } from "./InventoryFormSelect";
import { InventoryFormActions } from "./InventoryFormActions";

export function InventoryForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  title = "Inventory Item"
}: InventoryFormProps) {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when field is selected
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!values.name) {
      newErrors.name = "Name is required";
    }
    
    if (!values.sku) {
      newErrors.sku = "SKU is required";
    }
    
    if (!values.category) {
      newErrors.category = "Category is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(values);
    }
  };

  // Calculate status based on quantity and reorder_point
  const getStatus = (): string => {
    const quantity = Number(values.quantity) || 0;
    const reorderPoint = Number(values.reorder_point) || 10;
    
    if (quantity <= 0) {
      return "Out of Stock";
    } else if (quantity <= reorderPoint) {
      return "Low Stock";
    } else {
      return "In Stock";
    }
  };

  const categoryOptions = [
    "Parts", "Fluids", "Tools", "Accessories", "Electrical", "Engine", 
    "Suspension", "Brakes", "Filters", "Other"
  ];

  const supplierOptions = [
    "AutoZone", "NAPA", "O'Reilly", "Advance Auto Parts", "Dealer", 
    "Genuine Parts Co.", "Custom", "Other"
  ];

  const locationOptions = [
    "Main Storage", "Front Counter", "Back Room", "Mezzanine", 
    "Tool Cabinet", "Parts Cabinet", "Other"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{title}</h2>
          
          <InventoryFormField
            label="Name"
            name="name"
            value={values.name || ""}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Enter item name"
          />
          
          <InventoryFormField
            label="SKU"
            name="sku"
            value={values.sku || ""}
            onChange={handleChange}
            error={errors.sku}
            required
            placeholder="Enter unique SKU"
          />
          
          <InventoryFormSelect
            id="category"
            label="Category"
            value={values.category || ""}
            onValueChange={(value) => handleSelectChange("category", value)}
            options={categoryOptions}
            error={errors.category}
            required
          />
          
          <InventoryFormField
            label="Description"
            name="description"
            value={values.description || ""}
            onChange={handleChange}
            placeholder="Enter item description"
            as="textarea"
          />
        </div>
        
        <div className="space-y-6">
          <InventoryFormStatus status={values.status || getStatus()} />
          
          <InventoryFormField
            label="Quantity"
            name="quantity"
            value={values.quantity?.toString() || "0"}
            onChange={handleChange}
            type="number"
            min="0"
            step="1"
          />
          
          <InventoryFormField
            label="Reorder Point"
            name="reorder_point"
            value={values.reorder_point?.toString() || "10"}
            onChange={handleChange}
            type="number"
            min="0"
            step="1"
            description="Item will be marked as 'Low Stock' when quantity falls below this value"
          />
          
          <InventoryFormField
            label="Unit Price"
            name="unit_price"
            value={values.unit_price?.toString() || ""}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            description="Cost per unit"
          />
          
          <InventoryFormSelect
            id="supplier"
            label="Supplier"
            value={values.supplier || ""}
            onValueChange={(value) => handleSelectChange("supplier", value)}
            options={supplierOptions}
          />
          
          <InventoryFormSelect
            id="location"
            label="Storage Location"
            value={values.location || ""}
            onValueChange={(value) => handleSelectChange("location", value)}
            options={locationOptions}
          />
        </div>
      </div>
      
      <InventoryFormActions 
        loading={isSubmitting} 
        onCancel={onCancel}
      />
    </form>
  );
}
