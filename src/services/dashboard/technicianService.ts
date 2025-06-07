
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
    // Get technician profiles with time entries
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .not('first_name', 'is', null)
      .limit(5);

    if (!profiles || profiles.length === 0) {
      return { chartData: [], technicians: [] };
    }

    const technicians = profiles.map(p => `${p.first_name} ${p.last_name}`);
    
    // Get work order time entries for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: timeEntries } = await supabase
      .from('work_order_time_entries')
      .select('employee_id, duration, created_at')
      .gte('created_at', sixMonthsAgo.toISOString())
      .in('employee_id', profiles.map(p => p.id));

    // Group time entries by month
    const monthlyData: { [key: string]: { [key: string]: number } } = {};
    
    // Initialize months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    const actualMonths = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      actualMonths.push(months[monthIndex]);
      monthlyData[months[monthIndex]] = {};
      profiles.forEach(profile => {
        const techKey = `${profile.first_name} ${profile.last_name}`.toLowerCase().replace(/\s+/g, '_');
        monthlyData[months[monthIndex]][techKey] = 0;
      });
    }

    // Process time entries
    timeEntries?.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      const monthName = months[entryDate.getMonth()];
      const profile = profiles.find(p => p.id === entry.employee_id);
      
      if (profile && monthlyData[monthName]) {
        const techKey = `${profile.first_name} ${profile.last_name}`.toLowerCase().replace(/\s+/g, '_');
        monthlyData[monthName][techKey] += entry.duration / 60; // Convert minutes to hours
      }
    });

    const chartData = actualMonths.map(month => ({
      month,
      ...monthlyData[month]
    }));

    return {
      chartData,
      technicians
    };
  } catch (error) {
    console.error("Error fetching technician performance:", error);
    return { chartData: [], technicians: [] };
  }
};
