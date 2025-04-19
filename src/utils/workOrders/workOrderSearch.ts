
import { supabase } from "@/lib/supabase";
import { WorkOrder } from "@/types/workOrder";

export interface WorkOrderSearchParams {
  status?: string[];
  priority?: string[];
  technicianId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
  service_category_id?: string; // Added service category ID parameter
}

export const searchWorkOrders = async (params: WorkOrderSearchParams) => {
  let query = supabase
    .from('work_orders')
    .select(`
      *,
      customer:customers(first_name, last_name),
      technician:team_members(first_name, last_name),
      vehicle:vehicles(make, model, year)
    `, { count: 'exact' });

  if (params.status && params.status.length) {
    query = query.in('status', params.status);
  }

  if (params.priority && params.priority.length) {
    query = query.in('priority', params.priority);
  }

  if (params.technicianId) {
    query = query.eq('technician_id', params.technicianId);
  }

  if (params.dateFrom) {
    query = query.gte('created_at', params.dateFrom);
  }

  if (params.dateTo) {
    query = query.lte('created_at', params.dateTo);
  }

  // Add filter for service_category_id
  if (params.service_category_id) {
    query = query.eq('service_category_id', params.service_category_id);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, count, error } = await query.range(start, end);

  if (error) {
    console.error('Work Order Search Error:', error);
    throw error;
  }

  return {
    workOrders: data as WorkOrder[],
    total: count || 0,
    page,
    pageSize
  };
};
