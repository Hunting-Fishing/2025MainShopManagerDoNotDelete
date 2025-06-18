
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { WorkOrderSummaryCard } from './WorkOrderSummaryCard';
import { WorkOrderCustomerCard } from './WorkOrderCustomerCard';
import { WorkOrderTimeCard } from './WorkOrderTimeCard';
import { WorkOrderTotals } from '../shared/WorkOrderTotals';

interface WorkOrderOverviewTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  onPartsChange: () => Promise<void>;
  isEditMode: boolean;
}

export function WorkOrderOverviewTab({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onWorkOrderUpdate,
  onPartsChange,
  isEditMode
}: WorkOrderOverviewTabProps) {
  const totalPartsValue = allParts.reduce((sum, part) => sum + part.total_price, 0);
  const totalLaborHours = jobLines.reduce((sum, line) => sum + (line.estimated_hours || 0), 0);
  const totalLaborCost = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <WorkOrderSummaryCard
          title="Total Parts"
          value={`$${totalPartsValue.toFixed(2)}`}
          subtitle={`${allParts.length} items`}
        />
        <WorkOrderSummaryCard
          title="Labor Hours"
          value={`${totalLaborHours.toFixed(1)}h`}
          subtitle={`${jobLines.length} job lines`}
        />
        <WorkOrderSummaryCard
          title="Labor Cost"
          value={`$${totalLaborCost.toFixed(2)}`}
          subtitle="Estimated"
        />
        <WorkOrderSummaryCard
          title="Total Value"
          value={`$${(totalPartsValue + totalLaborCost).toFixed(2)}`}
          subtitle="Parts + Labor"
        />
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Customer Info */}
        <div className="lg:col-span-3 space-y-6">
          <WorkOrderCustomerCard customer={customer} workOrder={workOrder} />
          <WorkOrderTimeCard timeEntries={timeEntries} workOrder={workOrder} />
        </div>

        {/* Middle Column - Parts & Job Lines */}
        <div className="lg:col-span-6">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            allParts={allParts}
            jobLines={jobLines}
            onPartsChange={onPartsChange}
            isEditMode={isEditMode}
            showType="overview"
          />
        </div>

        {/* Right Column - Financial Totals */}
        <div className="lg:col-span-3">
          <WorkOrderTotals
            jobLines={jobLines}
            allParts={allParts}
          />
        </div>
      </div>
    </div>
  );
}
