
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { WorkOrderPartFormValues } from "@/types/workOrderPart";
import { SupplierSelector } from "./SupplierSelector";

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: "",
    partNumber: "",
    supplierName: "",
    supplierCost: 0,
    markupPercentage: 50,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: "non-inventory",
    notes: "",
  });

  const [userAdjustmentMarkup, setUserAdjustmentMarkup] = useState<number>(0);

  // Calculate base markup (supplier to retail)
  const baseMarkup = formData.supplierCost > 0 
    ? ((formData.retailPrice - formData.supplierCost) / formData.supplierCost) * 100 
    : 0;

  // Calculate effective total markup (supplier to customer)
  const effectiveTotalMarkup = formData.supplierCost > 0 
    ? ((formData.customerPrice - formData.supplierCost) / formData.supplierCost) * 100 
    : 0;

  // Update retail price when supplier cost or markup percentage changes
  useEffect(() => {
    if (formData.supplierCost > 0) {
      const newRetailPrice = formData.supplierCost * (1 + formData.markupPercentage / 100);
      setFormData(prev => ({
        ...prev,
        retailPrice: Number(newRetailPrice.toFixed(2))
      }));
    }
  }, [formData.supplierCost, formData.markupPercentage]);

  // Update customer price when retail price or user adjustment changes
  useEffect(() => {
    if (formData.retailPrice > 0) {
      const newCustomerPrice = formData.retailPrice * (1 + userAdjustmentMarkup / 100);
      setFormData(prev => ({
        ...prev,
        customerPrice: Number(newCustomerPrice.toFixed(2))
      }));
    }
  }, [formData.retailPrice, userAdjustmentMarkup]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: string | number) => {
    if (field === "customerPrice" && typeof value === "number") {
      // When customer price is manually changed, calculate user adjustment markup
      if (formData.retailPrice > 0) {
        const newUserAdjustment = ((value - formData.retailPrice) / formData.retailPrice) * 100;
        setUserAdjustmentMarkup(Number(newUserAdjustment.toFixed(2)));
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSliderChange = (values: number[]) => {
    const newUserAdjustment = values[0];
    setUserAdjustmentMarkup(newUserAdjustment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partName.trim()) return;

    onAddPart({
      ...formData,
      partType: "non-inventory",
    });

    // Reset form
    setFormData({
      partName: "",
      partNumber: "",
      supplierName: "",
      supplierCost: 0,
      markupPercentage: 50,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: "non-inventory",
      notes: "",
    });
    setUserAdjustmentMarkup(0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName}
            onChange={(e) => handleInputChange("partName", e.target.value)}
            placeholder="Enter part name"
            required
          />
        </div>

        <div>
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) => handleInputChange("partNumber", e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        <div>
          <Label htmlFor="supplierName">Supplier</Label>
          <SupplierSelector
            value={formData.supplierName}
            onChange={(value) => handleInputChange("supplierName", value)}
            placeholder="Select or add supplier"
          />
        </div>

        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
          />
        </div>

        <div>
          <Label htmlFor="supplierCost">Supplier Cost</Label>
          <Input
            id="supplierCost"
            type="number"
            step="0.01"
            min="0"
            value={formData.supplierCost}
            onChange={(e) => handleInputChange("supplierCost", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="markupPercentage">Base Markup % (Supplier → Retail)</Label>
          <Input
            id="markupPercentage"
            type="number"
            step="0.01"
            min="0"
            value={formData.markupPercentage}
            onChange={(e) => handleInputChange("markupPercentage", parseFloat(e.target.value) || 0)}
            placeholder="50.00"
          />
          <div className="text-xs text-gray-500 mt-1">
            Current: {baseMarkup.toFixed(2)}%
          </div>
        </div>

        <div>
          <Label htmlFor="retailPrice">Retail/List Price</Label>
          <Input
            id="retailPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.retailPrice}
            onChange={(e) => handleInputChange("retailPrice", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="customerPrice">Customer Price</Label>
          <Input
            id="customerPrice"
            type="number"
            step="0.01"
            min="0"
            value={formData.customerPrice}
            onChange={(e) => handleInputChange("customerPrice", parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
          <div className="text-xs text-gray-500 mt-1">
            Total Markup: {effectiveTotalMarkup.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>User Adjustment Markup % (Retail → Customer): {userAdjustmentMarkup.toFixed(2)}%</Label>
        <Slider
          value={[userAdjustmentMarkup]}
          onValueChange={handleSliderChange}
          max={100}
          min={-50}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>-50%</span>
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Additional notes or comments"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={!formData.partName.trim()}>
        Add Part
      </Button>
    </form>
  );
}
