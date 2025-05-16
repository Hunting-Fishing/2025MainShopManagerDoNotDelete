
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useInventoryForm } from '@/components/inventory/form/useInventoryForm';
import { InventoryItemExtended } from '@/types/inventory';
import { InventoryFormField } from './InventoryFormField';

interface InventoryFormProps {
  initialData?: InventoryItemExtended;
  onSubmit: (formData: Omit<InventoryItemExtended, "id">) => void;
  loading?: boolean;
  onCancel: () => void;
}

export function InventoryForm({ initialData, onSubmit, loading = false, onCancel }: InventoryFormProps) {
  const {
    formData,
    formErrors,
    categories,
    suppliers,
    validateForm,
    handleInputChange,
    handleTextAreaChange,
    handleSelectChange,
    handleRadioChange,
    resetForm
  } = useInventoryForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Item Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InventoryFormField
                  label="Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={formErrors.name}
                  required
                />
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
                  label="Part Number"
                  name="partNumber"
                  type="text"
                  value={formData.partNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Optional part number"
                />
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-sm text-red-500">{formErrors.category}</p>
                  )}
                </div>
                <InventoryFormField
                  label="Manufacturer"
                  name="manufacturer"
                  type="text"
                  value={formData.manufacturer || ""}
                  onChange={handleInputChange}
                />
                <InventoryFormField
                  label="Barcode"
                  name="barcode"
                  type="text"
                  value={formData.barcode || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="description" className="text-sm font-medium">Description</label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleTextAreaChange}
                  placeholder="Enter item description"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="itemCondition" className="text-sm font-medium">Condition</label>
                <select
                  id="itemCondition"
                  name="itemCondition"
                  value={formData.itemCondition || "New"}
                  onChange={handleSelectChange}
                  className="w-full border rounded p-2"
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Open Box">Open Box</option>
                </select>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              {/* Pricing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  label="Margin/Markup (%)"
                  name="marginMarkup"
                  type="number"
                  value={formData.marginMarkup || 0}
                  onChange={handleInputChange}
                  min={0}
                  step={0.01}
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
                  label="Special Tax (%)"
                  name="specialTax"
                  type="number"
                  value={formData.specialTax || 0}
                  onChange={handleInputChange}
                  min={0}
                  step={0.01}
                />
              </div>
            </TabsContent>

            <TabsContent value="fees" className="space-y-6">
              {/* Fees Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="space-y-3">
                <label htmlFor="otherFeeDescription" className="text-sm font-medium">Other Fee Description</label>
                <Textarea
                  id="otherFeeDescription"
                  name="otherFeeDescription"
                  value={formData.otherFeeDescription || ""}
                  onChange={handleTextAreaChange}
                  placeholder="Explanation of other fees if applicable"
                />
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-6">
              {/* Inventory Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="space-y-3">
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="Storage location (e.g., Shelf A-3)"
                  className="w-full border rounded p-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InventoryFormField
                  label="Total Qty Sold"
                  name="totalQtySold"
                  type="number"
                  value={formData.totalQtySold || 0}
                  onChange={handleInputChange}
                  min={0}
                  readOnly
                />
                <div className="space-y-2">
                  <label htmlFor="supplier" className="text-sm font-medium">Supplier</label>
                  <select
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleSelectChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup} value={sup}>{sup}</option>
                    ))}
                  </select>
                  {formErrors.supplier && (
                    <p className="text-sm text-red-500">{formErrors.supplier}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InventoryFormField
                  label="Vehicle Compatibility"
                  name="vehicleCompatibility"
                  type="text"
                  value={formData.vehicleCompatibility || ""}
                  onChange={handleInputChange}
                />
                <InventoryFormField
                  label="Warranty Period"
                  name="warrantyPeriod"
                  type="text"
                  value={formData.warrantyPeriod || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleTextAreaChange}
                  placeholder="Additional notes about this item"
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <div className="space-x-2">
            <Button variant="outline" type="button" onClick={resetForm}>
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
