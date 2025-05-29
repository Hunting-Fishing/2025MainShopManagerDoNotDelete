
import { supabase } from "@/lib/supabase";
import { TechnicianEfficiencyData } from "@/types/dashboard";

export interface TechnicianPerformanceData {
  chartData: Array<{
    month: string;
    [key: string]: string | number;
  }>;
  technicians: string[];
}

export const getTechnicianEfficiency = async (): Promise<TechnicianEfficiencyData[]> => {
  try {
    // Get technician data from profiles and work order time entries
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .not('first_name', 'is', null);

    if (!profiles) return [];

    // For each technician, calculate efficiency based on time entries
    const efficiencyData = await Promise.all(
      profiles.map(async (profile) => {
        const { data: timeEntries } = await supabase
          .from('work_order_time_entries')
          .select('duration, billable')
          .eq('employee_id', profile.id);

        const totalHours = timeEntries?.reduce((sum, entry) => sum + (entry.duration / 60), 0) || 0;
        const billableHours = timeEntries?.reduce((sum, entry) => 
          sum + (entry.billable ? entry.duration / 60 : 0), 0) || 0;
        
        const efficiency = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

        return {
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          totalHours,
          billableHours,
          efficiency
        };
      })
    );

    return efficiencyData.filter(data => data.totalHours > 0);
  } catch (error) {
    console.error("Error fetching technician efficiency:", error);
    return [];
  }
};

export const getTechnicianPerformance = async (): Promise<TechnicianPerformanceData> => {
  try {
    // Get technician profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .not('first_name', 'is', null)
      .limit(5);

    if (!profiles || profiles.length === 0) {
      return { chartData: [], technicians: [] };
    }

    const technicians = profiles.map(p => `${p.first_name} ${p.last_name}`);
    
    // Generate mock monthly performance data for the chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const chartData = months.map(month => {
      const monthData: any = { month };
      
      profiles.forEach((profile) => {
        const techName = `${profile.first_name} ${profile.last_name}`;
        const techKey = techName.toLowerCase().replace(/\s+/g, '_');
        // Generate random hours for demo (30-80 hours per month)
        monthData[techKey] = Math.floor(Math.random() * 50) + 30;
      });
      
      return monthData;
    });

    return {
      chartData,
      technicians
    };
  } catch (error) {
    console.error("Error fetching technician performance:", error);
    return { chartData: [], technicians: [] };
  }
};
