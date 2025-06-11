
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkOrderPart, partStatusMap } from '@/types/workOrderPart';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface PartsInventorySummaryProps {
  parts: WorkOrderPart[];
}

export function PartsInventorySummary({ parts }: PartsInventorySummaryProps) {
  // Calculate summary statistics
  const totalParts = parts.length;
  const totalValue = parts.reduce((sum, part) => sum + (part.customerPrice * part.quantity), 0);
  const totalCost = parts.reduce((sum, part) => sum + (part.supplierCost * part.quantity), 0);
  const totalMarkup = totalValue - totalCost;
  const markupPercentage = totalCost > 0 ? ((totalMarkup / totalCost) * 100) : 0;

  // Group parts by status
  const partsByStatus = parts.reduce((acc, part) => {
    const status = part.status || 'ordered';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group parts by type
  const partsByType = parts.reduce((acc, part) => {
    const type = part.partType || 'inventory';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get parts that need attention
  const backorderedParts = parts.filter(p => p.status === 'backordered').length;
  const defectiveParts = parts.filter(p => p.status === 'defective').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Financial Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Value:</span>
            <span className="font-medium">${totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Cost:</span>
            <span className="font-medium">${totalCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Markup:</span>
            <span className="font-medium text-green-600">
              ${totalMarkup.toFixed(2)} ({markupPercentage.toFixed(1)}%)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(partsByStatus).map(([status, count]) => (
            <div key={status} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={partStatusMap[status as keyof typeof partStatusMap]?.classes || ''}
                >
                  {partStatusMap[status as keyof typeof partStatusMap]?.label || status}
                </Badge>
              </div>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alerts & Attention */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Attention Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {backorderedParts > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600">Backordered:</span>
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                {backorderedParts}
              </Badge>
            </div>
          )}
          {defectiveParts > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-red-600">Defective:</span>
              <Badge variant="outline" className="bg-red-100 text-red-800">
                {defectiveParts}
              </Badge>
            </div>
          )}
          {backorderedParts === 0 && defectiveParts === 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All parts in good status</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
