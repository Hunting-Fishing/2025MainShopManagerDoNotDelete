
import React from 'react';
import { WorkOrder } from "@/types/workOrder";
import { WorkOrdersPageHeader } from '../sections/WorkOrdersPageHeader';
import { WorkOrderStatusCards } from '../sections/WorkOrderStatusCards';
import { WorkOrdersFilterSection } from '../sections/WorkOrdersFilterSection';
import { WorkOrderBatchActions } from '../sections/WorkOrderBatchActions';
import { WorkOrdersViewToggle } from '../sections/WorkOrdersViewToggle';
import { WorkOrderTable } from '../views/WorkOrderTable';
import { WorkOrderCardView } from '../views/WorkOrderCardView';
import { Button } from '@/components/ui/button';

interface WorkOrdersLayoutProps {
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

export function WorkOrdersLayout({
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
}: WorkOrdersLayoutProps) {
  const statusCounts = {
    pending: workOrders.filter(wo => wo.status === "pending").length,
    inProgress: workOrders.filter(wo => wo.status === "in-progress").length,
    completed: workOrders.filter(wo => wo.status === "completed").length
  };

  return (
    <div className="container mx-auto py-6">
      <WorkOrdersPageHeader 
        total={total} 
        currentCount={workOrders.length}
        {...statusCounts}
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
          <WorkOrderBatchActions selectedCount={selectedWorkOrders.length} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-sm text-gray-500">Select All</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Batch Actions</Button>
            <WorkOrdersViewToggle 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>
        </div>

        {viewMode === 'table' ? (
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
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
            <WorkOrderCardView workOrders={workOrders} />
          </div>
        )}
      </div>
    </div>
  );
}
