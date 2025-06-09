import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SupplierSelector } from '@/components/work-orders/parts/SupplierSelector';
import { WorkOrderPartFormValues, PART_CATEGORIES, WARRANTY_DURATIONS, PART_STATUSES } from '@/types/workOrderPart';

interface NonInventoryPartsTabProps {
  formData: WorkOrderPartFormValues;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: keyof WorkOrderPartFormValues, value: string) => void;
  onCheckboxChange: (name: keyof WorkOrderPartFormValues, checked: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function NonInventoryPartsTab({
  formData,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onSubmit,
  onCancel,
  isSubmitting = false
}: NonInventoryPartsTabProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onInputChange(e);
  };

  const handleSelectChange = (name: keyof WorkOrderPartFormValues, value: string) => {
    onSelectChange(name, value);
  };

  const handleCheckboxChange = (name: keyof WorkOrderPartFormValues, checked: boolean) => {
    onCheckboxChange(name, checked);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Part Name */}
        <div className="space-y-2">
          <Label htmlFor="partName" className="text-sm font-medium">
            Part Name *
          </Label>
          <Input
            id="partName"
            name="partName"
            value={formData.partName}
            onChange={handleInputChange}
            placeholder="Enter part name"
            required
          />
        </div>

        {/* Part Number */}
        <div className="space-y-2">
          <Label htmlFor="partNumber" className="text-sm font-medium">
            Part Number
          </Label>
          <Input
            id="partNumber"
            name="partNumber"
            value={formData.partNumber || ''}
            onChange={handleInputChange}
            placeholder="Enter part number"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={formData.category || ''}
            onValueChange={(value) => handleSelectChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PART_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PART_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Supplier - Now using SupplierSelector */}
        <div className="space-y-2">
          <Label htmlFor="supplierName" className="text-sm font-medium">
            Supplier
          </Label>
          <SupplierSelector
            value={formData.supplierName || ''}
            onChange={(value) => handleSelectChange('supplierName', value)}
            placeholder="Select supplier"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity" className="text-sm font-medium">
            Quantity *
          </Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            required
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm">Pricing Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="supplierCost" className="text-sm font-medium">
              Supplier Cost *
            </Label>
            <Input
              id="supplierCost"
              name="supplierCost"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierCost}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="markupPercentage" className="text-sm font-medium">
              Markup % *
            </Label>
            <Input
              id="markupPercentage"
              name="markupPercentage"
              type="number"
              step="0.01"
              min="0"
              value={formData.markupPercentage}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="retailPrice" className="text-sm font-medium">
              Retail Price *
            </Label>
            <Input
              id="retailPrice"
              name="retailPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.retailPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPrice" className="text-sm font-medium">
              Customer Price *
            </Label>
            <Input
              id="customerPrice"
              name="customerPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.customerPrice}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>
        </div>
      </div>

      {/* Additional Options */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm">Additional Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTaxable"
                checked={formData.isTaxable}
                onCheckedChange={(checked) => handleCheckboxChange('isTaxable', checked)}
              />
              <Label htmlFor="isTaxable" className="text-sm font-medium">
                Taxable
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isStockItem"
                checked={formData.isStockItem}
                onCheckedChange={(checked) => handleCheckboxChange('isStockItem', checked)}
              />
              <Label htmlFor="isStockItem" className="text-sm font-medium">
                Stock Item
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="coreChargeApplied"
                checked={formData.coreChargeApplied}
                onCheckedChange={(checked) => handleCheckboxChange('coreChargeApplied', checked)}
              />
              <Label htmlFor="coreChargeApplied" className="text-sm font-medium">
                Core Charge Applied
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            {formData.coreChargeApplied && (
              <div className="space-y-2">
                <Label htmlFor="coreChargeAmount" className="text-sm font-medium">
                  Core Charge Amount
                </Label>
                <Input
                  id="coreChargeAmount"
                  name="coreChargeAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.coreChargeAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="warrantyDuration" className="text-sm font-medium">
                Warranty Duration
              </Label>
              <Select
                value={formData.warrantyDuration || ''}
                onValueChange={(value) => handleSelectChange('warrantyDuration', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty" />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installedBy" className="text-sm font-medium">
                Installed By
              </Label>
              <Input
                id="installedBy"
                name="installedBy"
                value={formData.installedBy || ''}
                onChange={handleInputChange}
                placeholder="Enter installer name"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Order Information */}
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm">Order Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber" className="text-sm font-medium">
              Invoice Number
            </Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber || ''}
              onChange={handleInputChange}
              placeholder="Enter invoice number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poLine" className="text-sm font-medium">
              PO Line
            </Label>
            <Input
              id="poLine"
              name="poLine"
              value={formData.poLine || ''}
              onChange={handleInputChange}
              placeholder="Enter PO line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="installDate" className="text-sm font-medium">
              Install Date
            </Label>
            <Input
              id="installDate"
              name="installDate"
              type="date"
              value={formData.installDate || ''}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Customer Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            placeholder="Enter notes visible to customer"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notesInternal" className="text-sm font-medium">
            Internal Notes
          </Label>
          <Textarea
            id="notesInternal"
            name="notesInternal"
            value={formData.notesInternal || ''}
            onChange={handleInputChange}
            placeholder="Enter internal notes (not visible to customer)"
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Part'}
        </Button>
      </div>
    </div>
  );
}
