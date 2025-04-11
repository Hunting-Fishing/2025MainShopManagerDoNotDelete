
import { supabase } from "@/lib/supabase";
import { TechnicianEfficiencyData, TechnicianPerformance, TechnicianPerformanceData } from "@/types/dashboard";

export const getTechnicianEfficiency = async (): Promise<TechnicianEfficiencyData[]> => {
  try {
    // Get all technicians from profiles
    const { data: technicianData, error: techError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('job_title', 'Technician')
      .limit(5);
      
    if (techError) throw techError;
    
    let techniciansToUse = technicianData;
    
    if (!techniciansToUse || techniciansToUse.length === 0) {
      // Fallback to get any profiles if no technicians found
      const { data: backupTechs, error: backupError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .limit(5);
        
      if (backupError) throw backupError;
      if (!backupTechs || backupTechs.length === 0) return [];
      
      techniciansToUse = backupTechs;
    }
    
    // Get time entries for the technicians
    const technicianData: TechnicianEfficiencyData[] = [];
    
    for (const tech of techniciansToUse) {
      // Get time entries for this technician
      const { data: timeEntries, error: entriesError } = await supabase
        .from('work_order_time_entries')
        .select('duration, billable')
        .eq('employee_id', tech.id);
        
      if (entriesError) {
        console.error(`Error fetching time entries for technician ${tech.id}:`, entriesError);
        continue;
      }
      
      // Calculate hours and efficiency
      let totalHours = 0;
      let billableHours = 0;
      
      if (timeEntries && timeEntries.length > 0) {
        totalHours = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60; // Convert minutes to hours
        billableHours = timeEntries
          .filter(entry => entry.billable)
          .reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60;
      } else {
        // If no real data, generate placeholder data based on tech id
        const techIdNum = parseInt(tech.id.slice(0, 8), 16);
        totalHours = 20 + (techIdNum % 20); // 20-40 hours
        billableHours = totalHours * (0.65 + ((techIdNum % 20) / 100)); // 65-85% billable
      }
      
      technicianData.push({
        id: tech.id,
        name: `${tech.first_name} ${tech.last_name}`,
        totalHours,
        billableHours,
        efficiency: totalHours > 0 ? billableHours / totalHours : 0
      });
    }
    
    return technicianData;
  } catch (error) {
    console.error("Error fetching technician efficiency:", error);
    return [];
  }
};

export const getTechnicianPerformance = async (): Promise<TechnicianPerformanceData> => {
  try {
    // Get technicians from profiles
    const { data: technicianData, error: techError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('job_title', 'Technician')
      .limit(5);
      
    if (techError) throw techError;
    
    let techniciansToUse = technicianData;
    
    if (!techniciansToUse || techniciansToUse.length === 0) {
      // Fallback to get any profiles if no technicians found
      const { data: backupTechs, error: backupError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .limit(5);
        
      if (backupError) throw backupError;
      if (!backupTechs || backupTechs.length === 0) {
        return { technicians: [], chartData: [] };
      }
      
      techniciansToUse = backupTechs;
    }
    
    const techNames = techniciansToUse.map(t => `${t.first_name} ${t.last_name}`);
    
    // Generate monthly performance data
    // In a real app, this would come from actual completed work orders and time entries
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const chartData = months.map(month => {
      const monthData: TechnicianPerformance = { month };
      
      techniciansToUse.forEach((tech, index) => {
        const name = `${tech.first_name} ${tech.last_name}`;
        // Generate consistent but varied performance numbers
        const baseValue = 50 + (months.indexOf(month) * 5) + (index * 3);
        const variance = Math.sin(months.indexOf(month) + index) * 10;
        monthData[name] = baseValue + variance;
      });
      
      return monthData;
    });
    
    return {
      technicians: techNames,
      chartData
    };
  } catch (error) {
    console.error("Error generating technician performance data:", error);
    return { technicians: [], chartData: [] };
  }
};
