
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { InventoryItemExtended } from '@/types/inventory';
import { calculateTotalValue, countLowStockItems, countOutOfStockItems } from '@/utils/inventory';

interface InventoryStatsCardsProps {
  items: InventoryItemExtended[];
}

export function InventoryStatsCards({ items }: InventoryStatsCardsProps) {
  const totalItems = items.length;
  const totalValue = calculateTotalValue(items);
  const lowStockCount = countLowStockItems(items);
  const outOfStockCount = countOutOfStockItems(items);

  const stats = [
    {
      title: 'Total Items',
      value: totalItems.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Value',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Low Stock',
      value: lowStockCount.toString(),
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    {
      title: 'Out of Stock',
      value: outOfStockCount.toString(),
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className={`${stat.bgColor} ${stat.borderColor} border-2 hover:shadow-lg transition-all duration-200`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
