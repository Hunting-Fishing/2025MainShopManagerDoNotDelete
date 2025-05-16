
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItemExtended } from "@/types/inventory";
import { InventoryFormField } from "./InventoryFormField";
import { InventoryFormSelect } from "./InventoryFormSelect";

interface InventoryFormProps {
  formData: Omit<InventoryItemExtended, "id">;
  handleChange: (field: keyof Omit<InventoryItemExtended, "id">, value: any) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTextAreaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleRadioChange: (name: string, value: string) => void;
  formErrors: { [key: string]: string | undefined };
  categories: string[];
  suppliers: string[];
  resetForm: () => void;
  validateForm: () => boolean;
  onSubmit: (data: Omit<InventoryItemExtended, "id">) => void;
  loading?: boolean;
  onCancel?: () => void;
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  formData,
  handleChange,
  handleInputChange,
  handleTextAreaChange,
  handleSelectChange,
  handleRadioChange,
  formErrors,
  categories,
  suppliers,
  resetForm,
  validateForm,
  onSubmit,
  loading = false,
  onCancel
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
          
          <InventoryFormField
            label="Item Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            error={formErrors.name}
            required
          />
          
          <InventoryFormFormSelect
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleSelectChange}
            error={formErrors.category}
            required
            options={categories.map(category => ({ value: category, label: category }))}
          />

          <InventoryFormField
            label="Part Number"
            name="partNumber"
            type="text"
            value={formData.partNumber || ""}
            onChange={handleInputChange}
          />
          
          <InventoryFormField
            label="Barcode/UPC"
            name="barcode"
            type="text"
            value={formData.barcode || ""}
            onChange={handleInputChange}
          />
          
          <InventoryFormField
            label="Manufacturer"
            name="manufacturer"
            type="text"
            value={formData.manufacturer || ""}
            onChange={handleInputChange}
          />

          <InventoryFormFormSelect
            label="Supplier"
            name="supplier"
            value={formData.supplier}
            onChange={handleSelectChange}
            error={formErrors.supplier}
            required
            options={suppliers.map(supplier => ({ value: supplier, label: supplier }))}
          />

          {/* Select for Item Condition */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Item Condition
            </label>
            <select
              name="itemCondition"
              value={formData.itemCondition || ""}
              onChange={handleSelectChange}
              className="w-full border rounded p-2"
            >
              <option value="">Select Condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Open Box">Open Box</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Pricing Information</h2>
          
          <InventoryFormField
            label="Cost"
            name="cost"
            type="number"
            value={formData.cost || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <InventoryFormField
            label="Margin/Markup %"
            name="marginMarkup"
            type="number"
            value={formData.marginMarkup || 0}
            onChange={handleInputChange}
            min={0}
          />
          
          <InventoryFormField
            label="Unit Price"
            name="unit_price"
            type="number"
            value={formData.unit_price}
            onChange={handleInputChange}
            error={formErrors.unit_price}
            min={0}
            step={0.01}
            required
          />
          
          <InventoryFormField
            label="Retail Price"
            name="retailPrice"
            type="number"
            value={formData.retailPrice || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <InventoryFormField
            label="Wholesale Price"
            name="wholesalePrice"
            type="number"
            value={formData.wholesalePrice || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <InventoryFormField
            label="Special Tax %"
            name="specialTax"
            type="number"
            value={formData.specialTax || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Additional Fees */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Additional Fees</h2>
          
          <InventoryFormField
            label="Core Charge"
            name="coreCharge"
            type="number"
            value={formData.coreCharge || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <InventoryFormField
            label="Environmental Fee"
            name="environmentalFee"
            type="number"
            value={formData.environmentalFee || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <InventoryFormField
            label="Freight Fee"
            name="freightFee"
            type="number"
            value={formData.freightFee || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <InventoryFormField
            label="Other Fee"
            name="otherFee"
            type="number"
            value={formData.otherFee || 0}
            onChange={handleInputChange}
            min={0}
            step={0.01}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Other Fee Description
            </label>
            <Textarea
              name="otherFeeDescription"
              value={formData.otherFeeDescription || ""}
              onChange={handleTextAreaChange}
              placeholder="Description of other fee"
              className="w-full"
            />
          </div>
        </div>

        {/* Inventory Management */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Inventory Management</h2>
          
          <InventoryFormField
            label="SKU"
            name="sku"
            type="text"
            value={formData.sku}
            onChange={handleInputChange}
            error={formErrors.sku}
            required
          />
          
          <InventoryFormField
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleInputChange}
            error={formErrors.quantity}
            min={0}
            required
          />
          
          <InventoryFormField
            label="On Order"
            name="onOrder"
            type="number"
            value={formData.onOrder || 0}
            onChange={handleInputChange}
            min={0}
          />
          
          <InventoryFormField
            label="On Hold"
            name="onHold"
            type="number"
            value={formData.onHold || 0}
            onChange={handleInputChange}
            min={0}
          />
          
          <InventoryFormField
            label="Reorder Point"
            name="reorder_point"
            type="number"
            value={formData.reorder_point}
            onChange={handleInputChange}
            error={formErrors.reorder_point}
            min={0}
            required
          />
          
          <InventoryFormField
            label="Minimum Order"
            name="minimumOrder"
            type="number"
            value={formData.minimumOrder || 0}
            onChange={handleInputChange}
            min={0}
          />
          
          <InventoryFormField
            label="Maximum Order"
            name="maximumOrder"
            type="number"
            value={formData.maximumOrder || 0}
            onChange={handleInputChange}
            min={0}
          />
          
          <InventoryFormField
            label="Location"
            name="location"
            type="text"
            value={formData.location || ""}
            onChange={handleInputChange}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="status" 
                  value="In Stock" 
                  checked={formData.status === "In Stock"} 
                  onChange={() => handleRadioChange("status", "In Stock")}
                />
                <span>In Stock</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="status" 
                  value="Out of Stock" 
                  checked={formData.status === "Out of Stock"} 
                  onChange={() => handleRadioChange("status", "Out of Stock")}
                />
                <span>Out of Stock</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="status" 
                  value="Discontinued" 
                  checked={formData.status === "Discontinued"} 
                  onChange={() => handleRadioChange("status", "Discontinued")}
                />
                <span>Discontinued</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Additional Details</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Description
          </label>
          <Textarea
            name="description"
            value={formData.description || ""}
            onChange={handleTextAreaChange}
            placeholder="Item description"
            className="w-full"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Notes
          </label>
          <Textarea
            name="notes"
            value={formData.notes || ""}
            onChange={handleTextAreaChange}
            placeholder="Internal notes"
            className="w-full"
            rows={2}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        )}
        <Button type="button" onClick={resetForm} variant="outline">
          Reset
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Item"}
        </Button>
      </div>
    </form>
  );
};
