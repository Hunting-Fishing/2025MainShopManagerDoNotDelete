
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SupplierSelector } from './SupplierSelector';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface NonInventoryPart {
  id: string;
  description: string;
  partNumber: string;
  supplier: string;
  quantity: number;
  costPrice: number;
  retailPrice: number;
  markupPercentage: number;
  customerPrice: number;
  notes?: string;
}

interface NonInventoryPartsTabProps {
  workOrderId: string;
  onPartsChange?: (parts: NonInventoryPart[]) => void;
}

export const NonInventoryPartsTab: React.FC<NonInventoryPartsTabProps> = ({
  workOrderId,
  onPartsChange
}) => {
  const [parts, setParts] = useState<NonInventoryPart[]>([]);
  const [useMarkupSlider, setUseMarkupSlider] = useState(false);

  const createEmptyPart = (): NonInventoryPart => ({
    id: `temp-${Date.now()}-${Math.random()}`,
    description: '',
    partNumber: '',
    supplier: '',
    quantity: 1,
    costPrice: 0,
    retailPrice: 0,
    markupPercentage: 0,
    customerPrice: 0,
    notes: ''
  });

  useEffect(() => {
    if (parts.length === 0) {
      setParts([createEmptyPart()]);
    }
  }, []);

  const calculatePrices = (part: NonInventoryPart, field: string, value: number) => {
    const updatedPart = { ...part };

    if (field === 'costPrice') {
      updatedPart.costPrice = value;
      if (updatedPart.markupPercentage > 0) {
        updatedPart.retailPrice = value * (1 + updatedPart.markupPercentage / 100);
      }
      updatedPart.customerPrice = updatedPart.retailPrice;
    } else if (field === 'retailPrice') {
      updatedPart.retailPrice = value;
      if (updatedPart.costPrice > 0) {
        updatedPart.markupPercentage = ((value - updatedPart.costPrice) / updatedPart.costPrice) * 100;
      }
      updatedPart.customerPrice = value;
    } else if (field === 'markupPercentage') {
      updatedPart.markupPercentage = value;
      if (updatedPart.costPrice > 0) {
        updatedPart.retailPrice = updatedPart.costPrice * (1 + value / 100);
        updatedPart.customerPrice = updatedPart.retailPrice;
      }
    } else if (field === 'customerPrice') {
      updatedPart.customerPrice = value;
    }

    return updatedPart;
  };

  const updatePart = (index: number, field: keyof NonInventoryPart, value: any) => {
    const updatedParts = [...parts];
    
    if (field === 'costPrice' || field === 'retailPrice' || field === 'markupPercentage' || field === 'customerPrice') {
      updatedParts[index] = calculatePrices(updatedParts[index], field, parseFloat(value) || 0);
    } else {
      updatedParts[index] = { ...updatedParts[index], [field]: value };
    }
    
    setParts(updatedParts);
    onPartsChange?.(updatedParts);
  };

  const addPart = () => {
    const newParts = [...parts, createEmptyPart()];
    setParts(newParts);
    onPartsChange?.(newParts);
  };

  const removePart = (index: number) => {
    if (parts.length === 1) {
      toast.error("At least one part is required");
      return;
    }
    
    const updatedParts = parts.filter((_, i) => i !== index);
    setParts(updatedParts);
    onPartsChange?.(updatedParts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Non-Inventory Parts</h3>
        <div className="flex items-center space-x-2">
          <Label htmlFor="markup-slider">Use Sliding Markup Scale</Label>
          <Switch
            id="markup-slider"
            checked={useMarkupSlider}
            onCheckedChange={setUseMarkupSlider}
          />
        </div>
      </div>

      {parts.map((part, index) => (
        <Card key={part.id} className="relative">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Part {index + 1}</CardTitle>
              {parts.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removePart(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`description-${index}`}>Description *</Label>
                <Input
                  id={`description-${index}`}
                  value={part.description}
                  onChange={(e) => updatePart(index, 'description', e.target.value)}
                  placeholder="Enter part description"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`partNumber-${index}`}>Part Number</Label>
                <Input
                  id={`partNumber-${index}`}
                  value={part.partNumber}
                  onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                  placeholder="Enter part number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`supplier-${index}`}>Supplier</Label>
                <SupplierSelector
                  value={part.supplier}
                  onValueChange={(value) => updatePart(index, 'supplier', value)}
                  placeholder="Search suppliers..."
                />
              </div>
              
              <div>
                <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  value={part.quantity}
                  onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`costPrice-${index}`}>Cost Price *</Label>
                <Input
                  id={`costPrice-${index}`}
                  type="number"
                  step="0.01"
                  value={part.costPrice}
                  onChange={(e) => updatePart(index, 'costPrice', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor={`retailPrice-${index}`}>Retail/List Price</Label>
                <Input
                  id={`retailPrice-${index}`}
                  type="number"
                  step="0.01"
                  value={part.retailPrice}
                  onChange={(e) => updatePart(index, 'retailPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor={`markupPercentage-${index}`}>Markup %</Label>
                {useMarkupSlider ? (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="1"
                      value={part.markupPercentage}
                      onChange={(e) => updatePart(index, 'markupPercentage', e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-sm text-gray-600 text-center">
                      {part.markupPercentage.toFixed(1)}%
                    </div>
                  </div>
                ) : (
                  <Input
                    id={`markupPercentage-${index}`}
                    type="number"
                    step="0.1"
                    value={part.markupPercentage}
                    onChange={(e) => updatePart(index, 'markupPercentage', e.target.value)}
                    placeholder="0.0"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`customerPrice-${index}`}>Customer Price</Label>
                <Input
                  id={`customerPrice-${index}`}
                  type="number"
                  step="0.01"
                  value={part.customerPrice}
                  onChange={(e) => updatePart(index, 'customerPrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor={`notes-${index}`}>Notes</Label>
              <Textarea
                id={`notes-${index}`}
                value={part.notes || ''}
                onChange={(e) => updatePart(index, 'notes', e.target.value)}
                placeholder="Additional notes about this part..."
                rows={3}
              />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span>${(part.costPrice * part.quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Customer Price:</span>
                <span className="font-semibold">${(part.customerPrice * part.quantity).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addPart}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Part
      </Button>
    </div>
  );
};
