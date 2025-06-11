
import React from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, DollarSign, Hash, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface PartsInventorySummaryProps {
  parts: WorkOrderPart[];
}

export function PartsInventorySummary({ parts }: PartsInventorySummaryProps) {
  const totalParts = parts.length;
  const totalQuantity = parts.reduce((sum, part) => sum + part.quantity, 0);
  const totalValue = parts.reduce((sum, part) => sum + part.total_price, 0);
  const pendingParts = parts.filter(part => part.status === 'pending').length;
  const installedParts = parts.filter(part => part.status === 'installed').length;
  const orderedParts = parts.filter(part => part.status === 'ordered').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Parts</p>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">{totalParts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <Hash className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-green-700 dark:text-green-300">Quantity</p>
              <p className="text-xl font-bold text-green-900 dark:text-green-100">{totalQuantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">Total Value</p>
              <p className="text-xl font-bold text-purple-900 dark:text-purple-100">${totalValue.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Installed</p>
              <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100">{installedParts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Ordered</p>
              <p className="text-xl font-bold text-orange-900 dark:text-orange-100">{orderedParts}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Pending</p>
              <p className="text-xl font-bold text-red-900 dark:text-red-100">{pendingParts}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
