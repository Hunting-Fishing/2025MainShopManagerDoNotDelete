
import { supabase } from "@/lib/supabase";
import { TechnicianPerformanceData } from "@/types/dashboard";

export const getTechnicianPerformance = async (): Promise<TechnicianPerformanceData> => {
  try {
    // Fetch technician performance data from the last 6 months
    const { data, error } = await supabase
      .from('technician_performance')
      .select('*')
      .gte('month', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString())
      .order('month');

    if (error) throw error;

    // Transform data into required format
    const technicians = [...new Set(data.map(entry => entry.technician_name))];
    const chartData = data.reduce((acc, curr) => {
      const existingMonth = acc.find(item => item.month === curr.month);
      if (existingMonth) {
        existingMonth[curr.technician_name] = curr.efficiency_rate;
      } else {
        acc.push({
          month: curr.month,
          [curr.technician_name]: curr.efficiency_rate
        });
      }
      return acc;
    }, [] as any[]);

    return {
      technicians,
      chartData
    };
  } catch (error) {
    console.error("Error fetching technician performance:", error);
    return { technicians: [], chartData: [] };
  }
};

