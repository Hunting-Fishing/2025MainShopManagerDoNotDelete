
import React, { useMemo } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrdersPageHeader } from './WorkOrdersPageHeader';
import { WorkOrdersFilterSection } from './WorkOrdersFilterSection';
import { WorkOrderStatusCards } from './WorkOrderStatusCards';
import { WorkOrderTable } from './WorkOrderTable';
import { WorkOrderCardView } from './WorkOrderCardView';
import { WorkOrderBatchActions } from './WorkOrderBatchActions';
import { ViewModeToggle } from './ViewModeToggle';
import { Button } from '@/components/ui/button';

interface WorkOrdersPageContentProps {
  workOrders: WorkOrder[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedWorkOrders: WorkOrder[];
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  onPageChange: (page: number) => void;
  onSelectWorkOrder: (workOrder: WorkOrder, isSelected: boolean) => void;
  onSearch: (searchTerm: string) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onPriorityFilterChange: (priorities: string[]) => void;
  onServiceCategoryChange: (categoryId: string | null) => void;
  onTechnicianFilterChange: (techs: string[]) => void;
  technicians: string[];
}

export function WorkOrdersPageContent({
  workOrders,
  loading,
  total,
  page,
  pageSize,
  showFilters,
  setShowFilters,
  selectedWorkOrders,
  viewMode,
  setViewMode,
  onPageChange,
  onSelectWorkOrder,
  onSearch,
  onStatusFilterChange,
  onPriorityFilterChange,
  onServiceCategoryChange,
  onTechnicianFilterChange,
  technicians,
}: WorkOrdersPageContentProps) {
  const statusCounts = useMemo(() => {
    return workOrders.reduce(
      (counts, wo) => {
        if (wo.status === "pending") counts.pending++;
        else if (wo.status === "in-progress") counts.inProgress++;
        else if (wo.status === "completed") counts.completed++;
        return counts;
      },
      { pending: 0, inProgress: 0, completed: 0 }
    );
  }, [workOrders]);

  return (
    <div className="container mx-auto py-6">
      <WorkOrdersPageHeader 
        total={total} 
        currentCount={workOrders.length}
        pendingCount={statusCounts.pending}
        inProgressCount={statusCounts.inProgress}
        completedCount={statusCounts.completed}
      />

      <div className="mt-6">
        <WorkOrderStatusCards 
          workOrders={workOrders} 
          loading={loading} 
        />
      </div>

      <div className="mt-6">
        <WorkOrdersFilterSection
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          total={total}
          currentCount={workOrders.length}
          onSearch={onSearch}
          onStatusFilterChange={onStatusFilterChange}
          onPriorityFilterChange={onPriorityFilterChange}
          onServiceCategoryChange={onServiceCategoryChange}
          onTechnicianFilterChange={onTechnicianFilterChange}
          technicians={technicians}
        />
      </div>

      {selectedWorkOrders.length > 0 && (
        <div className="mt-4">
          <WorkOrderBatchActions 
            selectedCount={selectedWorkOrders.length}
          />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm text-gray-500">Select All</span>
          </div>
          <div>
            <Button variant="outline" size="sm" className="mr-2">Batch Actions</Button>
            <ViewModeToggle 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>
        </div>

        {viewMode === 'table' ? (
          <div>
            <WorkOrderTable 
              workOrders={workOrders} 
              loading={loading}
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={onPageChange}
              selectedWorkOrders={selectedWorkOrders}
              onSelectWorkOrder={onSelectWorkOrder}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
            <WorkOrderCardView workOrders={workOrders} />
          </div>
        )}
      </div>
    </div>
  );
}
