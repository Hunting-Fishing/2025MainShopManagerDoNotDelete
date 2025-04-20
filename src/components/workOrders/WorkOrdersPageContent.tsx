
import React, { useMemo } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrdersPageHeader } from './WorkOrdersPageHeader';
import { WorkOrdersFilterSection } from './WorkOrdersFilterSection';
import { WorkOrderStatusCards } from './WorkOrderStatusCards';
import { WorkOrderTable } from './WorkOrderTable';
import { WorkOrderCardView } from './WorkOrderCardView';
import { WorkOrderBatchActions } from './WorkOrderBatchActions';
import { ViewModeToggle } from './ViewModeToggle';

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
    <div className="container mx-auto py-6 space-y-6">
      <WorkOrdersPageHeader 
        total={total} 
        currentCount={workOrders.length}
        pendingCount={statusCounts.pending}
        inProgressCount={statusCounts.inProgress}
        completedCount={statusCounts.completed}
      />

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

      <WorkOrderStatusCards 
        workOrders={workOrders} 
        loading={loading} 
      />

      {selectedWorkOrders.length > 0 && (
        <WorkOrderBatchActions 
          selectedCount={selectedWorkOrders.length}
        />
      )}

      <div className="transition-all duration-200 ease-in-out">
        <ViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />

        {viewMode === 'table' ? (
          <div className="transition-opacity duration-200 ease-in-out">
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
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-200 ease-in-out">
            <WorkOrderCardView workOrders={workOrders} />
          </div>
        )}
      </div>
    </div>
  );
}
