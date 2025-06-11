
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart } from '@/types/workOrderPart';

export function PartsInventoryOverview() {
  // Sample data for demonstration - in a real app this would come from an API
  const sampleParts: WorkOrderPart[] = [
    {
      id: '1',
      work_order_id: 'wo-1',
      part_number: 'BR-001',
      name: 'Brake Pads',
      description: 'Front brake pads',
      quantity: 2,
      unit_price: 45.99,
      total_price: 91.98,
      status: 'installed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'Brakes',
      supplierName: 'AutoParts Inc',
      supplierCost: 35.00,
      supplierSuggestedRetailPrice: 50.99,
      customerPrice: 45.99,
      retailPrice: 45.99,
      warrantyDuration: '1 year',
      binLocation: 'A-12',
      partType: 'OEM',
      markupPercentage: 31.4,
      isTaxable: true
    }
  ];

  const totalValue = sampleParts.reduce((sum, part) => sum + part.total_price, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleParts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Parts Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleParts.map((part) => (
              <div key={part.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{part.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Part #: {part.part_number} | Qty: {part.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${part.total_price.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">{part.status}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
