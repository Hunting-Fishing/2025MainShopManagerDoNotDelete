
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPart } from '@/types/workOrderPart';

export function PartsWarrantyTracking() {
  // Sample data for demonstration
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
      warrantyDuration: '1 year',
      warrantyExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      installDate: new Date().toISOString(),
      retailPrice: 45.99
    },
    {
      id: '2',
      work_order_id: 'wo-2', 
      part_number: 'EN-002',
      name: 'Oil Filter',
      description: 'Engine oil filter',
      quantity: 1,
      unit_price: 12.99,
      total_price: 12.99,
      status: 'installed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      warrantyDuration: '6 months',
      warrantyExpiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      installDate: new Date().toISOString(),
      retailPrice: 12.99
    }
  ];

  const getWarrantyStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'Expired', variant: 'destructive' as const, days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'Expiring Soon', variant: 'destructive' as const, days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'Active', variant: 'secondary' as const, days: daysUntilExpiry };
    } else {
      return { status: 'Active', variant: 'default' as const, days: daysUntilExpiry };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Warranties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sampleParts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warranty Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleParts.map((part) => {
              const warrantyInfo = getWarrantyStatus(part.warrantyExpiryDate || '');
              
              return (
                <div key={part.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{part.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Part #: {part.part_number}
                      </div>
                    </div>
                    <Badge variant={warrantyInfo.variant}>
                      {warrantyInfo.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Install Date</div>
                      <div>{part.installDate ? new Date(part.installDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Warranty Period</div>
                      <div>{part.warrantyDuration || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Expiry Date</div>
                      <div>{part.warrantyExpiryDate ? new Date(part.warrantyExpiryDate).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Days Remaining</div>
                      <div>{warrantyInfo.days} days</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
