
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package } from 'lucide-react';
import { usePartsInventory } from '@/hooks/inventory/usePartsInventory';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface PartsSelectorProps {
  workOrderId: string;
  onPartsChange: (parts: WorkOrderInventoryItem[]) => void;
  initialParts?: WorkOrderInventoryItem[];
  readOnly?: boolean;
}

export function PartsSelector({ 
  workOrderId, 
  onPartsChange, 
  initialParts = [],
  readOnly = false 
}: PartsSelectorProps) {
  const [selectedParts, setSelectedParts] = useState<WorkOrderInventoryItem[]>(initialParts);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const { checkAvailability, adjustInventory } = usePartsInventory(workOrderId);

  useEffect(() => {
    const fetchAvailableParts = async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .gt('quantity', 0)
        .order('name');

      if (error) {
        console.error('Error fetching parts:', error);
        return;
      }

      setAvailableParts(data || []);
    };

    fetchAvailableParts();
  }, []);

  const handleAddPart = async (part: any) => {
    const isAvailable = await checkAvailability(part.id, 1);
    
    if (!isAvailable) {
      toast({
        title: "Insufficient Inventory",
        description: "This part is not available in the requested quantity",
        variant: "destructive"
      });
      return;
    }

    const newPart: WorkOrderInventoryItem = {
      id: part.id,
      name: part.name,
      sku: part.sku,
      category: part.category,
      quantity: 1,
      unitPrice: part.unit_price,
    };

    const success = await adjustInventory(part.id, 1, 'reserve');
    
    if (success) {
      const updatedParts = [...selectedParts, newPart];
      setSelectedParts(updatedParts);
      onPartsChange(updatedParts);
    }
  };

  const handleUpdateQuantity = async (partId: string, newQuantity: number) => {
    const part = selectedParts.find(p => p.id === partId);
    if (!part) return;

    const quantityDiff = newQuantity - part.quantity;
    
    if (quantityDiff > 0) {
      const isAvailable = await checkAvailability(partId, quantityDiff);
      if (!isAvailable) {
        toast({
          title: "Insufficient Inventory",
          description: "Cannot increase quantity - insufficient stock",
          variant: "destructive"
        });
        return;
      }
    }

    const success = await adjustInventory(
      partId,
      Math.abs(quantityDiff),
      quantityDiff > 0 ? 'reserve' : 'return'
    );

    if (success) {
      const updatedParts = selectedParts.map(p => 
        p.id === partId ? { ...p, quantity: newQuantity } : p
      );
      setSelectedParts(updatedParts);
      onPartsChange(updatedParts);
    }
  };

  const handleRemovePart = async (partId: string) => {
    const part = selectedParts.find(p => p.id === partId);
    if (!part) return;

    const success = await adjustInventory(partId, part.quantity, 'return');
    
    if (success) {
      const updatedParts = selectedParts.filter(p => p.id !== partId);
      setSelectedParts(updatedParts);
      onPartsChange(updatedParts);
    }
  };

  if (readOnly) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Parts & Materials</h3>
        {selectedParts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {selectedParts.map(part => (
              <div key={part.id} className="py-3">
                <div className="flex justify-between">
                  <span className="font-medium">{part.name}</span>
                  <span className="text-gray-600">
                    {part.quantity} × ${part.unitPrice}
                  </span>
                </div>
                <div className="text-sm text-gray-500">SKU: {part.sku}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">No parts added</div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Parts & Materials</h3>
        <Button variant="outline" size="sm">
          <Package className="w-4 h-4 mr-2" />
          Add Part
        </Button>
      </div>

      {selectedParts.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {selectedParts.map(part => (
            <div key={part.id} className="py-3 flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{part.name}</div>
                <div className="text-sm text-gray-500">SKU: {part.sku}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(part.id, part.quantity - 1)}
                    disabled={part.quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    value={part.quantity}
                    onChange={(e) => handleUpdateQuantity(part.id, parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateQuantity(part.id, part.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemovePart(part.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No parts added</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add parts and materials to this work order
          </p>
        </div>
      )}
    </div>
  );
}
