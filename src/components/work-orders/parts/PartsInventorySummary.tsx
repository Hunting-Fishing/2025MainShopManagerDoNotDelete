
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Package, DollarSign, Hash, TrendingUp } from 'lucide-react';

interface PartsInventorySummaryProps {
  parts: WorkOrderPart[];
}

export function PartsInventorySummary({ parts }: PartsInventorySummaryProps) {
  // Calculate summary statistics
  const totalParts = parts.length;
  const totalQuantity = parts.reduce((sum, part) => sum + (Number(part.quantity) || 0), 0);
  const totalValue = parts.reduce((sum, part) => {
    const quantity = Number(part.quantity) || 0;
    const unitPrice = Number(part.unit_price) || 0;
    const partTotal = part.total_price || (quantity * unitPrice);
    return sum + partTotal;
  }, 0);
  
  const installedParts = parts.filter(part => part.status === 'installed').length;
  const pendingParts = parts.filter(part => part.status === 'pending').length;
  const orderedParts = parts.filter(part => part.status === 'ordered').length;

  const summaryCards = [
    {
      title: 'Total Parts',
      value: totalParts,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Quantity',
      value: totalQuantity,
      icon: Hash,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Installed',
      value: installedParts,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Parts Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {(pendingParts > 0 || orderedParts > 0) && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-4 text-sm">
              {pendingParts > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span>{pendingParts} Pending</span>
                </div>
              )}
              {orderedParts > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>{orderedParts} Ordered</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
