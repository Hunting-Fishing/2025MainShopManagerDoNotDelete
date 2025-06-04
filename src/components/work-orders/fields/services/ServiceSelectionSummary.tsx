
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { ServiceSelectionSummary } from '@/types/selectedService';
import { Clock, DollarSign, Package } from 'lucide-react';

interface ServiceSelectionSummaryProps {
  summary: ServiceSelectionSummary;
}

export function ServiceSelectionSummary({ summary }: ServiceSelectionSummaryProps) {
  if (summary.totalServices === 0) return null;

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Services</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {summary.totalServices}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {summary.totalEstimatedTime > 0 ? (
                summary.totalEstimatedTime > 60 ? (
                  `${Math.floor(summary.totalEstimatedTime / 60)}h ${summary.totalEstimatedTime % 60}m`
                ) : (
                  `${summary.totalEstimatedTime}m`
                )
              ) : (
                'TBD'
              )}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Cost</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {summary.totalEstimatedCost > 0 ? (
                `$${summary.totalEstimatedCost.toFixed(2)}`
              ) : (
                'TBD'
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
