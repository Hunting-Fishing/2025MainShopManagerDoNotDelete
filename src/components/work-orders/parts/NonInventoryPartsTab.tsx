import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Calculator } from "lucide-react";
import { WorkOrderPartFormValues } from "@/types/workOrderPart";
import { useToast } from "@/hooks/use-toast";

interface NonInventoryPartsTabProps {
  parts: WorkOrderPartFormValues[];
  onPartsChange: (parts: WorkOrderPartFormValues[]) => void;
}

export const NonInventoryPartsTab: React.FC<NonInventoryPartsTabProps> = ({
  parts,
  onPartsChange
}) => {
  const { toast } = useToast();
  const [markupScaleEnabled, setMarkupScaleEnabled] = useState<{ [key: number]: boolean }>({});

  const createNewPart = (): WorkOrderPartFormValues => ({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 0, // Initialize to 0
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    invoiceNumber: '',
    poLine: '',
    notes: ''
  });

  const addPart = () => {
    const newParts = [...parts, createNewPart()];
    onPartsChange(newParts);
  };

  const removePart = (index: number) => {
    const newParts = parts.filter((_, i) => i !== index);
    onPartsChange(newParts);
    
    // Clean up markup scale state
    const newMarkupScaleEnabled = { ...markupScaleEnabled };
    delete newMarkupScaleEnabled[index];
    
    // Reindex the remaining items
    const reindexed: { [key: number]: boolean } = {};
    Object.keys(newMarkupScaleEnabled).forEach(key => {
      const oldIndex = parseInt(key);
      if (oldIndex > index) {
        reindexed[oldIndex - 1] = newMarkupScaleEnabled[oldIndex];
      } else if (oldIndex < index) {
        reindexed[oldIndex] = newMarkupScaleEnabled[oldIndex];
      }
    });
    
    setMarkupScaleEnabled(reindexed);
  };

  const updatePart = (index: number, field: keyof WorkOrderPartFormValues, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    onPartsChange(newParts);
  };

  // Calculate markup percentage only when both supplier cost and retail price are present
  const calculateDisplayMarkup = (supplierCost: number, retailPrice: number): number => {
    if (supplierCost > 0 && retailPrice > 0) {
      return ((retailPrice - supplierCost) / supplierCost) * 100;
    }
    return 0;
  };

  const handleSupplierCostChange = (index: number, value: string) => {
    const supplierCost = parseFloat(value) || 0;
    const currentPart = parts[index];
    
    updatePart(index, 'supplierCost', supplierCost);
    
    // Calculate and update markup percentage if retail price exists
    if (currentPart.retailPrice > 0) {
      const calculatedMarkup = calculateDisplayMarkup(supplierCost, currentPart.retailPrice);
      updatePart(index, 'markupPercentage', calculatedMarkup);
      
      // Update customer price if markup scale is enabled
      if (markupScaleEnabled[index]) {
        const customerPrice = currentPart.retailPrice * (1 + calculatedMarkup / 100);
        updatePart(index, 'customerPrice', customerPrice);
      }
    }
  };

  const handleRetailPriceChange = (index: number, value: string) => {
    const retailPrice = parseFloat(value) || 0;
    const currentPart = parts[index];
    
    updatePart(index, 'retailPrice', retailPrice);
    
    // Calculate and update markup percentage if supplier cost exists
    if (currentPart.supplierCost > 0) {
      const calculatedMarkup = calculateDisplayMarkup(currentPart.supplierCost, retailPrice);
      updatePart(index, 'markupPercentage', calculatedMarkup);
      
      // Update customer price if markup scale is enabled
      if (markupScaleEnabled[index]) {
        const customerPrice = retailPrice * (1 + calculatedMarkup / 100);
        updatePart(index, 'customerPrice', customerPrice);
      }
    } else {
      // If no supplier cost, just update customer price to match retail price when markup scale is enabled
      if (markupScaleEnabled[index]) {
        updatePart(index, 'customerPrice', retailPrice);
      }
    }
  };

  const handleMarkupChange = (index: number, markup: number) => {
    const currentPart = parts[index];
    
    updatePart(index, 'markupPercentage', markup);
    
    // Only update customer price if markup scale is enabled
    if (markupScaleEnabled[index] && currentPart.retailPrice > 0) {
      const customerPrice = currentPart.retailPrice * (1 + markup / 100);
      updatePart(index, 'customerPrice', customerPrice);
    }
  };

  const handleCustomerPriceChange = (index: number, value: string) => {
    const customerPrice = parseFloat(value) || 0;
    updatePart(index, 'customerPrice', customerPrice);
  };

  const toggleMarkupScale = (index: number, enabled: boolean) => {
    setMarkupScaleEnabled(prev => ({ ...prev, [index]: enabled }));
    
    const currentPart = parts[index];
    if (enabled && currentPart.retailPrice > 0) {
      // When enabling markup scale, calculate customer price based on current retail price and markup
      const customerPrice = currentPart.retailPrice * (1 + currentPart.markupPercentage / 100);
      updatePart(index, 'customerPrice', customerPrice);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Non-Inventory Parts</h3>
        <Button onClick={addPart} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Part
        </Button>
      </div>

      {parts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No parts added yet. Click "Add Part" to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {parts.map((part, index) => (
            <div key={index} className="border rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Part #{index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removePart(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`partName-${index}`}>Part Name *</Label>
                  <Input
                    id={`partName-${index}`}
                    value={part.partName}
                    onChange={(e) => updatePart(index, 'partName', e.target.value)}
                    placeholder="Enter part name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`partNumber-${index}`}>Part Number</Label>
                  <Input
                    id={`partNumber-${index}`}
                    value={part.partNumber || ''}
                    onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                    placeholder="Enter part number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`supplierName-${index}`}>Supplier</Label>
                  <Input
                    id={`supplierName-${index}`}
                    value={part.supplierName || ''}
                    onChange={(e) => updatePart(index, 'supplierName', e.target.value)}
                    placeholder="Enter supplier name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`supplierCost-${index}`}>Supplier Cost *</Label>
                  <Input
                    id={`supplierCost-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={part.supplierCost}
                    onChange={(e) => handleSupplierCostChange(index, e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`retailPrice-${index}`}>Retail/List Price *</Label>
                  <Input
                    id={`retailPrice-${index}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={part.retailPrice}
                    onChange={(e) => handleRetailPriceChange(index, e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={part.quantity}
                    onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Markup Calculation</Label>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`markupScale-${index}`} className="text-sm">
                        Auto-adjust customer price
                      </Label>
                      <Switch
                        id={`markupScale-${index}`}
                        checked={markupScaleEnabled[index] || false}
                        onCheckedChange={(checked) => toggleMarkupScale(index, checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Markup %</Label>
                      <span className="text-sm font-medium">
                        {part.markupPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      value={[part.markupPercentage]}
                      onValueChange={(value) => handleMarkupChange(index, value[0])}
                      max={200}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>200%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`customerPrice-${index}`}>Customer Price *</Label>
                    <Input
                      id={`customerPrice-${index}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={part.customerPrice}
                      onChange={(e) => handleCustomerPriceChange(index, e.target.value)}
                      placeholder="0.00"
                      disabled={markupScaleEnabled[index]}
                    />
                    {markupScaleEnabled[index] && (
                      <p className="text-xs text-muted-foreground">
                        Customer price is automatically calculated based on retail price and markup
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`invoiceNumber-${index}`}>Invoice Number</Label>
                    <Input
                      id={`invoiceNumber-${index}`}
                      value={part.invoiceNumber || ''}
                      onChange={(e) => updatePart(index, 'invoiceNumber', e.target.value)}
                      placeholder="Enter invoice number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`poLine-${index}`}>PO Line</Label>
                    <Input
                      id={`poLine-${index}`}
                      value={part.poLine || ''}
                      onChange={(e) => updatePart(index, 'poLine', e.target.value)}
                      placeholder="Enter PO line"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${index}`}>Notes</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={part.notes || ''}
                      onChange={(e) => updatePart(index, 'notes', e.target.value)}
                      placeholder="Additional notes about this part..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Supplier Cost:</span>
                    <p className="font-medium">${part.supplierCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Retail Price:</span>
                    <p className="font-medium">${part.retailPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer Price:</span>
                    <p className="font-medium">${part.customerPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <p className="font-semibold">${(part.customerPrice * part.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-lg font-semibold">
                  Total Parts Cost: ${parts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
