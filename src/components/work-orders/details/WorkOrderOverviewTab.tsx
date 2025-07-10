
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderLineItems } from '../job-lines/WorkOrderLineItems';
import { WorkOrderCustomerCard } from './WorkOrderCustomerCard';
import { WorkOrderTimeCard } from './WorkOrderTimeCard';
import { WorkOrderTotals } from '../shared/WorkOrderTotals';

interface WorkOrderOverviewTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onWorkOrderUpdate: () => Promise<void>;
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
  return (
    <div className="space-y-6 fade-in">
      {/* Main Content Layout - Focused on detailed information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column - Customer & Time Info */}
        <div className="lg:col-span-4 space-y-6 slide-up">
          <WorkOrderCustomerCard customer={customer} workOrder={workOrder} />
          <WorkOrderTimeCard timeEntries={timeEntries} workOrder={workOrder} />
        </div>

        {/* Middle Column - Parts & Job Lines */}
        <div className="lg:col-span-5 slide-up">
          <div className="modern-card gradient-border">
            <WorkOrderLineItems
              jobLines={jobLines}
              allParts={allParts}
              workOrderId={workOrder.id}
              isEditMode={isEditMode}
              onJobLinesChange={() => {}}
              onPartsChange={onPartsChange}
            />
          </div>
        </div>

        {/* Right Column - Financial Summary */}
        <div className="lg:col-span-3 slide-up">
          <WorkOrderTotals
            jobLines={jobLines}
            allParts={allParts}
          />
        </div>
      </div>
    </div>
  );
}
