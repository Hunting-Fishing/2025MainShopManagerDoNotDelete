
import { supabase } from "@/lib/supabase";

export interface TechnicianEfficiency {
  technician_name: string;
  efficiency_rate: number;
  tasks_completed: number;
  hours_logged: number;
  average_task_time: number;
}

export const getTechnicianEfficiency = async (): Promise<TechnicianEfficiency[]> => {
  try {
    // Fetch technician efficiency data
    const { data, error } = await supabase
      .from('technician_performance')
      .select('*')
      .order('efficiency_rate', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error("Error fetching technician efficiency:", error);
    return [];
  }
};
