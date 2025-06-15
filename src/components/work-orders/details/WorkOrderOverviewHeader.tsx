
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from "@/lib/utils";

interface WorkOrderOverviewHeaderProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
}

// Helper to format currency
const formatUsd = (val: number) =>
  val?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? "$0.00";

export function WorkOrderOverviewHeader({
  workOrder,
  jobLines,
  allParts,
  timeEntries
}: WorkOrderOverviewHeaderProps) {
  // Calculate estimated/booked hours and amount
  const totalEstimatedHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborAmount = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);

  // Calculate PARTS: use supplierCost/retailPrice if possible, else fallback
  let partsCost = 0;
  let partsRevenue = 0;
  let partsCount = 0;

  allParts.forEach(part => {
    // Used for cost (pure cost to shop, not selling price)
    // Prefer supplierCost, fallback to unit_price (often sale price, be aware)
    const cost = part.supplierCost ?? part.unit_price ?? 0;
    const qty = part.quantity || 1;
    partsCost += cost * qty;
    // Used for revenue (what customer is charged)
    // Prefer customerPrice, fallback to unit_price
    const price = part.customerPrice ?? part.unit_price ?? 0;
    partsRevenue += price * qty;
    partsCount += qty;
  });

  const partsProfit = partsRevenue - partsCost;

  // Labor (actual/tech time): group time entries by employee
  const techMap: Record<string, { name: string; time: number }> = {};
  let totalTechHours = 0;
  timeEntries?.forEach(t => {
    // Duration is in minutes by your schema—convert to hours
    const hours = (t.duration || 0) / 60;
    if (!techMap[t.employee_id]) {
      techMap[t.employee_id] = { name: t.employee_name || "Technician", time: 0 };
    }
    techMap[t.employee_id].time += hours;
    totalTechHours += hours;
  });

  // Labor revenue/efficiency
  const laborRate = jobLines.length === 1 ? (jobLines[0].labor_rate || 0) : 0; // Could be improved for multiple lines
  const laborRevenue = totalLaborAmount;
  const laborProfit = laborRevenue; // If you want to break out labor cost, adjust as needed

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Job Lines</p>
            <p className="text-2xl font-bold">{jobLines.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total (Book) Hours</p>
            <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tech Hours (Actual)</p>
            <p className="text-2xl font-bold">{totalTechHours.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parts Used</p>
            <p className="text-2xl font-bold">{partsCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t pt-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Parts Revenue</p>
            <p className="font-bold">{formatUsd(partsRevenue)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parts Cost</p>
            <p className="font-bold text-blue-700">{formatUsd(partsCost)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parts Profit</p>
            <p className={cn("font-bold", partsProfit >= 0 ? "text-green-700" : "text-red-700")}>
              {formatUsd(partsProfit)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Labor Revenue</p>
            <p className="font-bold">{formatUsd(laborRevenue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Book vs Actual Hours</p>
            <p>
              <span className="font-bold">{totalEstimatedHours.toFixed(1)}</span>
              <span className="mx-2 text-muted-foreground">booked</span>
              <span className="font-bold">{totalTechHours.toFixed(1)}</span>
              <span className="ml-1 text-muted-foreground">actual</span>
            </p>
          </div>
          {Object.keys(techMap).length > 1 && (
            <div>
              <p className="text-sm text-muted-foreground">By Technician</p>
              <div className="space-y-1 mt-1">
                {Object.entries(techMap).map(([id, { name, time }]) => (
                  <div key={id} className="flex justify-between text-sm">
                    <span>{name}</span>
                    <span className="font-mono">{time.toFixed(2)} h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
