
import { supabase } from '@/lib/supabase';
import { EquipmentRecommendation, TechnicianPerformance } from '@/types/dashboard';

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    // Get current date and date for 30 days ago
    const currentDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    
    // Format dates for queries
    const today = currentDate.toISOString().split('T')[0];
    const pastMonth = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Count active work orders
    const { data: activeOrdersData, error: activeOrdersError } = await supabase
      .from('work_orders')
      .select('id')
      .in('status', ['pending', 'in-progress'])
      .limit(1000);
      
    if (activeOrdersError) throw activeOrdersError;
    
    const activeOrders = activeOrdersData?.length || 0;
    
    // Get team members count
    const { count: teamMembersCount, error: teamMembersError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });
      
    if (teamMembersError) throw teamMembersError;
    
    // Get inventory items count
    const { count: inventoryItemsCount, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('id', { count: 'exact', head: true });
      
    if (inventoryError) throw inventoryError;
    
    // Calculate average completion time
    const { data: completedOrdersData, error: completionError } = await supabase
      .from('work_orders')
      .select('created_at, updated_at')
      .eq('status', 'completed')
      .limit(100);
      
    if (completionError) throw completionError;
    
    let averageCompletionTime = 'N/A';
    let completionTimeChange = '0%';
    
    if (completedOrdersData && completedOrdersData.length > 0) {
      const totalDays = completedOrdersData.reduce((sum, order) => {
        const created = new Date(order.created_at);
        const completed = new Date(order.updated_at);
        const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      
      averageCompletionTime = `${(totalDays / completedOrdersData.length).toFixed(1)} days`;
      // Mock change for now, in production would compare to previous period
      completionTimeChange = '-5%';
    }
    
    // Get changes (for now using mocked values for simplicity)
    const activeOrdersChange = '+12%';
    const teamMembersChange = '+2%';
    const inventoryItemsChange = '-3%';
    
    return {
      activeOrders,
      activeOrdersChange,
      teamMembersCount,
      teamMembersChange,
      inventoryItemsCount,
      inventoryItemsChange,
      averageCompletionTime,
      completionTimeChange,
      revenue: 0 // Added for type compatibility
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      activeOrders: 0,
      activeOrdersChange: '0%',
      teamMembersCount: 0,
      teamMembersChange: '0%',
      inventoryItemsCount: 0,
      inventoryItemsChange: '0%',
      averageCompletionTime: 'N/A',
      completionTimeChange: '0%',
      revenue: 0
    };
  }
}

// Get recent work orders for the dashboard
export async function getRecentWorkOrders(limit = 5) {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id, 
        status, 
        description, 
        created_at,
        priority,
        customer_id,
        customers (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    return data.map(order => {
      // Get customer name from join or use placeholder
      const customerName = order.customers 
        ? `${order.customers.first_name} ${order.customers.last_name}`
        : 'Unknown Customer';
        
      return {
        id: order.id,
        customerName,
        description: order.description,
        status: order.status,
        created_at: order.created_at,
        // Assign a priority if not present in the data
        priority: order.priority || 'Medium'
      };
    });
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    return [];
  }
}

// Get equipment maintenance recommendations
export async function getEquipmentRecommendations(): Promise<EquipmentRecommendation[]> {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .lte('next_maintenance_date', new Date().toISOString().split('T')[0])
      .order('next_maintenance_date', { ascending: true })
      .limit(5);
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(item => {
      // Determine priority based on how overdue the maintenance is
      const nextDate = new Date(item.next_maintenance_date);
      const currentDate = new Date();
      const daysPassed = Math.floor((currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let priority: 'High' | 'Medium' | 'Low' = 'Medium';
      if (daysPassed > 30) {
        priority = 'High';
      } else if (daysPassed < 7) {
        priority = 'Low';
      }
      
      return {
        id: item.id,
        name: item.name,
        model: item.model,
        manufacturer: item.manufacturer,
        maintenanceDate: item.next_maintenance_date,
        maintenanceType: item.maintenance_frequency,
        status: item.status,
        priority
      };
    });
  } catch (error) {
    console.error("Error fetching equipment recommendations:", error);
    return [];
  }
}

// Get work order status counts for the pie chart
export async function getWorkOrderStatusCounts() {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('status');
      
    if (error) throw error;
    
    // Count occurrences of each status
    const statusCounts = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0
    };
    
    data.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });
    
    // Format for pie chart
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  } catch (error) {
    console.error("Error fetching work order status counts:", error);
    return [];
  }
}

// Get technician performance data for the chart
export async function getTechnicianPerformance(): Promise<TechnicianPerformance> {
  try {
    // First get all technicians (from profiles table)
    const { data: technicianData, error: techError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(10);
      
    if (techError) throw techError;
    
    if (!technicianData || technicianData.length === 0) {
      return { chartData: [], technicians: [] };
    }
    
    // Create list of technician names
    const technicians = technicianData.map(tech => 
      `${tech.first_name} ${tech.last_name}`
    );
    
    // Create 6 months of sample data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const chartData = months.map(month => {
      const monthData: Record<string, any> = { month };
      
      // Add random data for each technician
      technicians.forEach(tech => {
        // Convert technician name to safe property name
        const techKey = tech.toLowerCase().replace(/\s+/g, '_');
        // Random count between 3-15
        monthData[techKey] = Math.floor(Math.random() * 12) + 3;
      });
      
      return monthData;
    });
    
    return { chartData, technicians };
  } catch (error) {
    console.error("Error fetching technician performance:", error);
    return { chartData: [], technicians: [] };
  }
}
