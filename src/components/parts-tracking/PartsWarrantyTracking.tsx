
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Badge } from '@/components/ui/badge';

export function PartsWarrantyTracking() {
  // Sample data with all required properties
  const sampleParts: WorkOrderPart[] = [
    {
      id: '1',
      work_order_id: 'wo-1',
      part_number: 'BR-001',
      name: 'Brake Pads - Front',
      description: 'Premium ceramic brake pads',
      quantity: 1,
      unit_price: 89.99,
      total_price: 89.99,
      status: 'installed',
      part_type: 'inventory',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      warrantyDuration: '2 years',
      warrantyExpiryDate: '2026-06-23',
      installDate: '2024-06-23',
      retailPrice: 89.99
    },
    {
      id: '2',
      work_order_id: 'wo-2',
      part_number: 'EN-102',
      name: 'Engine Oil Filter',
      description: 'High-performance oil filter',
      quantity: 1,
      unit_price: 24.99,
      total_price: 24.99,
      status: 'installed',
      part_type: 'inventory',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      warrantyDuration: '1 year',
      warrantyExpiryDate: '2025-06-23',
      installDate: '2024-06-23',
      retailPrice: 24.99
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parts Warranty Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleParts.map((part) => (
              <div key={part.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{part.name}</h3>
                    <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                  </div>
                  <Badge variant="outline">{part.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Install Date</p>
                    <p className="font-medium">{part.installDate}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Warranty Duration</p>
                    <p className="font-medium">{part.warrantyDuration}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">{part.warrantyExpiryDate}</p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-medium">${part.retailPrice?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
