
import { supabase } from "@/lib/supabase";
import { TechnicianEfficiencyData, TechnicianPerformanceData } from "@/types/dashboard";

// Get technician efficiency metrics
export const getTechnicianEfficiency = async (): Promise<TechnicianEfficiencyData[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_time_entries')
      .select(`
        employee_id,
        employee_name,
        billable,
        duration
      `);
      
    if (error) throw error;
    
    // Group by technician
    const technicianMap = {};
    
    data.forEach(entry => {
      if (!technicianMap[entry.employee_id]) {
        technicianMap[entry.employee_id] = {
          id: entry.employee_id,
          name: entry.employee_name,
          totalHours: 0,
          billableHours: 0,
          efficiency: 0
        };
      }
      
      const hours = entry.duration / 60; // Convert minutes to hours
      technicianMap[entry.employee_id].totalHours += hours;
      
      if (entry.billable) {
        technicianMap[entry.employee_id].billableHours += hours;
      }
    });
    
    // Calculate efficiency ratios
    return Object.values(technicianMap).map(tech => {
      tech.efficiency = tech.totalHours > 0 ? 
        Math.round((tech.billableHours / tech.totalHours) * 100) : 0;
      return tech;
    });
  } catch (error) {
    console.error("Error fetching technician efficiency:", error);
    return [];
  }
};

// Get technician performance data for charts
export const getTechnicianPerformance = async (): Promise<TechnicianPerformanceData> => {
  try {
    // Fetch work order time entries to calculate technician performance
    const { data: entries, error } = await supabase
      .from('work_order_time_entries')
      .select(`
        id,
        employee_id,
        employee_name,
        billable,
        duration,
        created_at
      `)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    if (!entries || entries.length === 0) {
      return { technicians: [], chartData: [] };
    }
    
    // Extract unique technicians
    const technicianSet = new Set<string>();
    entries.forEach(entry => {
      if (entry.employee_name) {
        technicianSet.add(entry.employee_name);
      }
    });
    const technicians = Array.from(technicianSet);
    
    // Group entries by month
    const monthlyData = new Map<string, Record<string, number>>();
    
    entries.forEach(entry => {
      if (!entry.created_at) return;
      
      const date = new Date(entry.created_at);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      const techKey = entry.employee_name?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
      const hours = entry.duration / 60; // Convert minutes to hours
      
      if (!monthlyData.has(monthYear)) {
        monthlyData.set(monthYear, {});
      }
      
      const monthData = monthlyData.get(monthYear)!;
      monthData[techKey] = (monthData[techKey] || 0) + hours;
    });
    
    // Convert to chart data format
    const chartData = Array.from(monthlyData.entries()).map(([month, data]) => {
      return {
        month,
        ...data
      };
    });
    
    // Sort chartData by month chronologically
    chartData.sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });
    
    return {
      technicians,
      chartData
    };
  } catch (error) {
    console.error("Error fetching technician performance data:", error);
    return { technicians: [], chartData: [] };
  }
};
