
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Hash, AlertTriangle } from 'lucide-react';

interface PartsInventorySummaryProps {
  parts: WorkOrderPart[];
}

export function PartsInventorySummary({ parts }: PartsInventorySummaryProps) {
  const totalParts = parts.length;
  const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0);
  const totalValue = parts.reduce((sum, part) => sum + part.total_price, 0);
  const pendingParts = parts.filter(part => part.status === 'pending').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Parts</p>
              <p className="text-2xl font-bold">{totalParts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="text-2xl font-bold">{totalQuantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{pendingParts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
