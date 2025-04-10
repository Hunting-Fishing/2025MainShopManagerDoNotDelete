
import { WorkOrder, StaffMember } from "@/types/invoice";
import { InventoryItem } from "@/types/inventory";
import { supabase } from "@/lib/supabase";
import { TimeEntry } from "@/types/workOrder";

// Format time helper
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  if (!minutes) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${remainingMinutes}m`;
};

// Real data fetching functions
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id,
        description,
        status,
        start_time,
        end_time,
        created_at,
        technician_id,
        customer_id,
        customers(
          first_name,
          last_name
        ),
        profiles(
          first_name,
          last_name
        ),
        work_order_time_entries(
          id,
          employee_id,
          employee_name,
          start_time,
          end_time,
          duration,
          notes,
          billable
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching work orders:", error);
      return [];
    }
    
    return data.map(wo => {
      // Map time entries to match TimeEntry interface
      const timeEntries: TimeEntry[] = (wo.work_order_time_entries || []).map(entry => ({
        id: entry.id,
        employeeId: entry.employee_id,
        employeeName: entry.employee_name,
        startTime: entry.start_time,
        endTime: entry.end_time || null,
        duration: entry.duration || 0,
        notes: entry.notes || '',
        billable: entry.billable
      }));
      
      // Build customer and technician names safely
      const customers = wo.customers || {};
      const profiles = wo.profiles || {};
      const customerName = `${customers.first_name || ''} ${customers.last_name || ''}`.trim();
      const technicianName = `${profiles.first_name || ''} ${profiles.last_name || ''}`.trim();
      
      // Cast status to the expected type
      const status = (wo.status || 'pending') as "pending" | "in-progress" | "completed" | "cancelled";
      
      return {
        id: wo.id,
        customer: customerName,
        description: wo.description || '',
        status: status,
        date: wo.created_at,
        dueDate: wo.end_time || '',
        priority: 'medium' as "low" | "medium" | "high", // Default priority
        technician: technicianName || 'Unassigned',
        location: '', // Location is not in the database schema yet
        timeEntries,
        totalBillableTime: timeEntries.reduce((sum, entry) => 
          sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0
      };
    });
  } catch (err) {
    console.error("Error in fetchWorkOrders:", err);
    return [];
  }
};

// Fetch real inventory items from Supabase
export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('id, name, sku, category, unit_price, description');
      
    if (error) {
      console.error("Error fetching inventory items:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      price: item.unit_price,
      description: item.description || '',
    }));
  } catch (err) {
    console.error("Error in fetchInventoryItems:", err);
    return [];
  }
};

// Fetch staff members from profiles with technician role
export const fetchStaffMembers = async (): Promise<StaffMember[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        first_name, 
        last_name, 
        job_title,
        user_roles!inner (
          roles:role_id (
            name
          )
        )
      `)
      .order('first_name');
      
    if (error) {
      console.error("Error fetching staff members:", error);
      return [];
    }
    
    return data.map((profile) => {
      // Parse ID to number if possible
      const id = parseInt(profile.id);
      return {
        id: isNaN(id) ? 0 : id, // Convert to 0 if parsing fails to match StaffMember type
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        role: profile.job_title || 'Technician'
      };
    });
  } catch (err) {
    console.error("Error in fetchStaffMembers:", err);
    return [];
  }
};
