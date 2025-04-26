
import React from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormSelect } from "./InventoryFormSelect";
import { InventoryFormStatus } from "./InventoryFormStatus";
import { InventoryFormActions } from "./InventoryFormActions";
import { useInventoryForm, InventoryFormValues } from "./useInventoryForm";
import { Controller } from "react-hook-form";

interface InventoryFormProps {
  onSubmit: (data: Omit<InventoryItemExtended, "id">) => Promise<void>;
  loading: boolean;
  onCancel: () => void;
  item?: InventoryItemExtended;
}

export function InventoryForm({ onSubmit, loading, onCancel, item }: InventoryFormProps) {
  const { form, isEditing, onSubmit: handleSubmit } = useInventoryForm({ 
    item, 
    onSuccess: onCancel
  });

  // Get categories and suppliers data (In a real app, these would be fetched from an API)
  const categories = ["Parts", "Tools", "Accessories", "Consumables", "Other"];
  const suppliers = ["Supplier A", "Supplier B", "Supplier C", "Supplier D"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormField
              label="Name"
              name="name"
              value={field.value}
              onChange={field.onChange}
              required
              placeholder="Enter item name"
              error={fieldState.error?.message}
            />
          )}
        />
        
        <Controller
          name="sku"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormField
              label="SKU"
              name="sku"
              value={field.value}
              onChange={field.onChange}
              required
              placeholder="Enter SKU"
              error={fieldState.error?.message}
            />
          )}
        />
        
        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormSelect
              id="category"
              label="Category"
              value={field.value}
              onValueChange={field.onChange}
              options={categories}
              error={fieldState.error?.message}
              required
            />
          )}
        />
        
        <Controller
          name="supplier"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormSelect
              id="supplier"
              label="Supplier"
              value={field.value}
              onValueChange={field.onChange}
              options={suppliers}
              error={fieldState.error?.message}
              required
            />
          )}
        />
        
        <Controller
          name="quantity"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormField
              label="Quantity"
              name="quantity"
              type="number"
              value={field.value?.toString() || "0"}
              onChange={(value) => field.onChange(Number(value))}
              required
              min="0"
              error={fieldState.error?.message}
            />
          )}
        />
        
        <Controller
          name="min_stock_level"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormField
              label="Reorder Point"
              name="min_stock_level"
              type="number"
              value={field.value?.toString() || "5"}
              onChange={(value) => field.onChange(Number(value))}
              required
              min="0"
              error={fieldState.error?.message}
              description="Inventory status will be set to 'Low Stock' when quantity falls below this value"
            />
          )}
        />
        
        <Controller
          name="unit_price"
          control={form.control}
          render={({ field, fieldState }) => (
            <InventoryFormField
              label="Unit Price"
              name="unit_price"
              type="number"
              value={field.value?.toString() || "0"}
              onChange={(value) => field.onChange(Number(value))}
              required
              min="0"
              step="0.01"
              error={fieldState.error?.message}
            />
          )}
        />
        
        <Controller
          name="location"
          control={form.control}
          render={({ field }) => (
            <InventoryFormField
              label="Location"
              name="location"
              value={field.value || ""}
              onChange={field.onChange}
              placeholder="Enter storage location"
            />
          )}
        />
      </div>
      
      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <InventoryFormField
            label="Description"
            name="description"
            value={field.value || ""}
            onChange={field.onChange}
            placeholder="Enter item description"
          />
        )}
      />
      
      <Controller
        name="status"
        control={form.control}
        render={({ field }) => (
          <InventoryFormStatus 
            value={field.value} 
            onValueChange={field.onChange} 
          />
        )}
      />
      
      <InventoryFormActions
        loading={loading}
        onCancel={onCancel}
        isEditing={isEditing}
      />
    </form>
  );
}
