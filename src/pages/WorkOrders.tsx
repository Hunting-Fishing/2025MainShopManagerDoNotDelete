import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import WorkOrdersHeader from '@/components/workOrders/WorkOrdersHeader';
import WorkOrderFilters from '@/components/workOrders/WorkOrderFilters';
import WorkOrdersTable from '@/components/workOrders/WorkOrdersTable';
import WorkOrdersPagination from '@/components/workOrders/WorkOrdersPagination';
import { WorkOrderStats } from '@/components/workOrders/WorkOrderStats';
import { WorkOrderBatchActions } from '@/components/workOrders/WorkOrderBatchActions';
import { WorkOrder } from '@/types/workOrder';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { WorkOrderCardView } from '@/components/workOrders/WorkOrderCardView';

// Mock function for fetching work orders
const findWorkOrders = async ({ page, pageSize, search }: { page: number, pageSize: number, search: string }) => {
  // This is a temporary mock implementation
  return {
    data: [] as WorkOrder[],
    total: 0
  };
};

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedWorkOrders, setSelectedWorkOrders] = useState<WorkOrder[]>([]);
  const [view, setView] = useState<'table' | 'card'>('table');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, total } = await findWorkOrders({ page, pageSize, search });
        setWorkOrders(data);
        setTotal(total);
      } catch (error) {
        console.error("Failed to fetch work orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, pageSize, search]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPage(1); // Reset to the first page when searching
  };

  const handleSelectWorkOrder = (workOrder: WorkOrder, isSelected: boolean) => {
    setSelectedWorkOrders(prev => {
      if (isSelected) {
        return [...prev, workOrder];
      } else {
        return prev.filter(wo => wo.id !== workOrder.id);
      }
    });
  };

  return (
    <ResponsiveContainer>
      <div className="space-y-6">
        <WorkOrdersHeader
          workOrders={workOrders}
        />

        <WorkOrderFilters
          searchQuery={search}
          setSearchQuery={handleSearch}
          statusFilter={[]}
          setStatusFilter={() => {}}
        />

        <WorkOrderStats />

        <WorkOrderBatchActions 
          selectedCount={selectedWorkOrders.length}
        />

        <Tabs defaultValue="table" className="w-full">
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
          </TabsList>
          
          <TabsContent value="table" className="outline-none">
            <WorkOrdersTable
              workOrders={workOrders}
              selectedWorkOrders={selectedWorkOrders}
              onSelectWorkOrder={handleSelectWorkOrder}
            />
            <WorkOrdersPagination
              currentPage={page}
              totalPages={Math.ceil(total / pageSize)}
              onPageChange={handlePageChange}
            />
          </TabsContent>

          <TabsContent value="card" className="outline-none">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {workOrders.map((workOrder) => (
                <WorkOrderCardView 
                  key={workOrder.id} 
                  workOrders={[workOrder]} 
                />
              ))}
            </div>
            <WorkOrdersPagination
              currentPage={page}
              totalPages={Math.ceil(total / pageSize)}
              onPageChange={handlePageChange}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveContainer>
  );
};

export default WorkOrders;
