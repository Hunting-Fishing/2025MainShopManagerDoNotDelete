
import { useState, useCallback } from "react";
import { WorkOrder, WorkOrderSearchParams } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

export function useWorkOrderSearch() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Store current search parameters
  const [searchParams, setSearchParams] = useState<WorkOrderSearchParams>({
    page: 1,
    pageSize: 10,
  });

  const searchOrders = useCallback(async (params: Partial<WorkOrderSearchParams>) => {
    // Merge with existing params and update state
    const updatedParams = { ...searchParams, ...params };
    setSearchParams(updatedParams);
    
    setLoading(true);
    try {
      let query = supabase
        .from('work_orders')
        .select('*, timeEntries:work_order_time_entries(*), inventoryItems:work_order_inventory_items(*)', { count: 'exact' });
        
      // Apply status filter
      if (updatedParams.status && updatedParams.status.length > 0) {
        query = query.in('status', updatedParams.status);
      }
      
      // Apply priority filter
      if (updatedParams.priority && updatedParams.priority.length > 0) {
        query = query.in('priority', updatedParams.priority);
      }
      
      // Apply technician filter
      if (updatedParams.technicianId) {
        query = query.eq('technician', updatedParams.technicianId);
      }
      
      // Apply date range filter
      if (updatedParams.dateFrom) {
        query = query.gte('date', updatedParams.dateFrom);
      }
      
      if (updatedParams.dateTo) {
        query = query.lte('date', updatedParams.dateTo);
      }
      
      // Apply search term filter
      if (updatedParams.searchTerm) {
        query = query.or(
          `description.ilike.%${updatedParams.searchTerm}%,customer.ilike.%${updatedParams.searchTerm}%,id.ilike.%${updatedParams.searchTerm}%`
        );
      }
      
      // Apply service category filter
      if (updatedParams.service_category_id) {
        query = query.eq('service_category_id', updatedParams.service_category_id);
      }
      
      // Apply pagination
      const pageToUse = updatedParams.page || 1;
      const pageSizeToUse = updatedParams.pageSize || 10;
      
      const from = (pageToUse - 1) * pageSizeToUse;
      const to = from + pageSizeToUse - 1;
      
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);
        
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Map response to work orders with timeEntries and inventoryItems
      const mappedWorkOrders = data.map((order: any): WorkOrder => ({
        id: order.id,
        customer: order.customer || 'Unknown Customer',
        description: order.description || '',
        status: order.status,
        priority: order.priority || 'medium',
        technician: order.technician || 'Unassigned',
        date: order.created_at,
        dueDate: order.end_time || order.created_at,
        location: order.location || '',
        notes: order.notes,
        timeEntries: order.timeEntries || [],
        inventoryItems: order.inventoryItems || [],
        createdAt: order.created_at,
        startTime: order.start_time,
        endTime: order.end_time,
        serviceType: order.service_type,
        service_category_id: order.service_category_id,
        vehicleMake: order.vehicle_make,
        vehicleModel: order.vehicle_model,
        total_cost: order.total_cost,
      }));
      
      setWorkOrders(mappedWorkOrders);
      setTotal(count || mappedWorkOrders.length);
    } catch (error) {
      console.error('Error searching work orders:', error);
      toast({
        title: "Error",
        description: "Failed to load work orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  return {
    workOrders,
    loading,
    searchOrders,
    total,
    page,
    pageSize,
    setPage,
    setPageSize,
  };
}
