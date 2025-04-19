
import { useState, useCallback } from 'react';
import { WorkOrder, WorkOrderSearchParams } from "@/types/workOrder";
import { searchWorkOrders } from "@/utils/workOrders/workOrderSearch";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderSearch = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentParams, setCurrentParams] = useState<WorkOrderSearchParams>({});

  const searchOrders = useCallback(async (params: WorkOrderSearchParams) => {
    setLoading(true);
    
    // Merge the new params with existing ones, but replace arrays
    const mergedParams = {
      ...currentParams,
      ...params,
    };
    
    // Update stored params
    setCurrentParams(mergedParams);
    
    try {
      const result = await searchWorkOrders({
        ...mergedParams,
        page: params.page || page,
        pageSize: params.pageSize || pageSize
      });

      setWorkOrders(result.workOrders);
      setTotal(result.total);
      
      // Update page if it was part of the request
      if (params.page) {
        setPage(params.page);
      }
      
      // Update pageSize if it was part of the request
      if (params.pageSize) {
        setPageSize(params.pageSize);
      }
    } catch (error) {
      console.error("Error searching work orders:", error);
      toast({
        title: "Search Error",
        description: "Could not fetch work orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [currentParams, page, pageSize]);

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
