
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Wrench, Package, DollarSign } from 'lucide-react';

interface WorkOrderOverviewHeaderProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
}

export function WorkOrderOverviewHeader({
  workOrder,
  jobLines,
  allParts,
  timeEntries
}: WorkOrderOverviewHeaderProps) {
  // Calculate totals
  const totalJobLines = jobLines.length;
  const totalBookedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalActualHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60; // Convert minutes to hours
  const partsUsed = allParts.length;
  const partsRevenue = allParts.reduce((sum, part) => sum + ((part.customerPrice || part.unit_price) * part.quantity), 0);
  const partsCost = allParts.reduce((sum, part) => sum + ((part.supplierCost || 0) * part.quantity), 0);
  const partsProfit = partsRevenue - partsCost;
  const laborRevenue = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
  const techHoursActual = totalActualHours;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
      {/* Job Lines */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Wrench className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground">Job Lines</span>
          </div>
          <span className="text-sm font-bold">{totalJobLines}</span>
        </div>
      </Card>

      {/* Total Hours */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-green-500" />
            <span className="text-xs font-medium text-muted-foreground">Total (Book) Hours</span>
          </div>
          <span className="text-sm font-bold">{totalBookedHours.toFixed(1)}</span>
        </div>
      </Card>

      {/* Tech Hours */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-medium text-muted-foreground">Tech Hours (Actual)</span>
          </div>
          <span className="text-sm font-bold">{techHoursActual.toFixed(1)}</span>
        </div>
      </Card>

      {/* Parts Used */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3 text-purple-500" />
            <span className="text-xs font-medium text-muted-foreground">Parts Used</span>
          </div>
          <span className="text-sm font-bold">{partsUsed}</span>
        </div>
      </Card>

      {/* Parts Revenue */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-muted-foreground">Parts Revenue</span>
          </div>
          <span className="text-sm font-bold">${partsRevenue.toFixed(2)}</span>
        </div>
      </Card>

      {/* Parts Cost */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-red-500" />
            <span className="text-xs font-medium text-muted-foreground">Parts Cost</span>
          </div>
          <span className="text-sm font-bold">${partsCost.toFixed(2)}</span>
        </div>
      </Card>

      {/* Parts Profit */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground">Parts Profit</span>
          </div>
          <span className="text-sm font-bold">${partsProfit.toFixed(2)}</span>
        </div>
      </Card>

      {/* Labor Revenue */}
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-emerald-600" />
            <span className="text-xs font-medium text-muted-foreground">Labor Revenue</span>
          </div>
          <span className="text-sm font-bold">${laborRevenue.toFixed(2)}</span>
        </div>
      </Card>
    </div>
  );
}
