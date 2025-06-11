
import React, { useState } from 'react';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InventoryPartsTabProps {
  onPartAdd: (part: WorkOrderPartFormValues) => void;
}

export function InventoryPartsTab({ onPartAdd }: InventoryPartsTabProps) {
  const [selectedParts, setSelectedParts] = useState<any[]>([]);

  // Sample inventory parts
  const inventoryParts = [
    {
      id: '1',
      part_number: 'BR-001',
      name: 'Brake Pads',
      unit_price: 45.99,
      quantity_in_stock: 10
    },
    {
      id: '2',
      part_number: 'OIL-001',
      name: 'Engine Oil Filter',
      unit_price: 12.99,
      quantity_in_stock: 25
    }
  ];

  const handleAddPart = (inventoryPart: any) => {
    const partFormData: WorkOrderPartFormValues = {
      part_number: inventoryPart.part_number,
      name: inventoryPart.name,
      unit_price: inventoryPart.unit_price,
      quantity: 1,
      description: '',
      status: 'pending'
    };
    
    onPartAdd(partFormData);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {inventoryParts.map((part) => (
          <Card key={part.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{part.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground">Part #: {part.part_number}</div>
                  <div className="text-sm">Price: ${part.unit_price}</div>
                  <div className="text-sm">Stock: {part.quantity_in_stock}</div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => handleAddPart(part)}
                  disabled={part.quantity_in_stock === 0}
                >
                  Add to Work Order
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
