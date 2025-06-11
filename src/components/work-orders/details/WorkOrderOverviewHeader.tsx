
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkOrderOverviewHeaderProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
}

export function WorkOrderOverviewHeader({
  workOrder,
  jobLines,
  allParts
}: WorkOrderOverviewHeaderProps) {
  console.log('WorkOrderOverviewHeader - Received data:');
  console.log('- workOrder:', workOrder);
  console.log('- jobLines:', jobLines);
  console.log('- allParts:', allParts);
  
  // Calculate total estimated hours from job lines
  const totalEstimatedHours = jobLines.reduce((sum, line) => {
    const hours = Number(line.estimated_hours) || 0;
    console.log(`Job Line "${line.name}": ${hours} hours`);
    return sum + hours;
  }, 0);
  
  // Calculate total amount from job lines
  const totalAmount = jobLines.reduce((sum, line) => {
    const amount = Number(line.total_amount) || 0;
    console.log(`Job Line "${line.name}": $${amount}`);
    return sum + amount;
  }, 0);

  // Count total parts (from job lines + standalone parts)
  const totalPartsCount = allParts.length;

  console.log('WorkOrderOverviewHeader - Calculated totals:');
  console.log('- Job Lines Count:', jobLines.length);
  console.log('- Total Hours:', totalEstimatedHours);
  console.log('- Total Parts:', totalPartsCount);
  console.log('- Total Amount:', totalAmount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Order Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Job Lines</p>
            <p className="text-2xl font-bold">{jobLines.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold">{totalEstimatedHours.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Parts Count</p>
            <p className="text-2xl font-bold">{totalPartsCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
