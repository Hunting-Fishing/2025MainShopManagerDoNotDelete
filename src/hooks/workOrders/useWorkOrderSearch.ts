
import { useState } from 'react';
import { WorkOrder, WorkOrderSearchParams } from "@/types/workOrder";
import { searchWorkOrders } from "@/utils/workOrders/workOrderSearch";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderSearch = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const searchOrders = async (params: WorkOrderSearchParams) => {
    setLoading(true);
    try {
      const result = await searchWorkOrders({
        ...params,
        page,
        pageSize
      });

      setWorkOrders(result.workOrders);
      setTotal(result.total);
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Could not fetch work orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    workOrders,
    total,
    page,
    pageSize,
    loading,
    searchOrders,
    setPage,
    setPageSize
  };
};
