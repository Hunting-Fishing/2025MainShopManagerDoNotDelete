import { supabase } from "@/lib/supabase";

export interface WorkOrderPhase {
  name: string;
  completed: number;
  total: number;
  completion_rate: number;
}

export const getPhaseProgress = async (): Promise<WorkOrderPhase[]> => {
  try {
    // Fetch work order phase progress data
    const { data, error } = await supabase
      .from('work_order_phases')
      .select('name, completed, total')
      .order('name');
    
    if (error) throw error;
    
    // Calculate completion rates for each phase
    return data.map(phase => ({
      ...phase,
      completion_rate: phase.total > 0 
        ? Math.round((phase.completed / phase.total) * 100)
        : 0
    }));
  } catch (error) {
    console.error("Error fetching work order phase progress:", error);
    return [];
  }
};

export const getWorkOrderPhaseCompletionRate = async (): Promise<string> => {
  try {
    // Calculate the overall phase completion rate across all phases
    const phases = await getPhaseProgress();
    
    if (phases.length === 0) return 'N/A';
    
    const totalCompleted = phases.reduce((sum, phase) => sum + phase.completed, 0);
    const totalPhases = phases.reduce((sum, phase) => sum + phase.total, 0);
    
    const completionRate = totalPhases > 0 
      ? Math.round((totalCompleted / totalPhases) * 100)
      : 0;
    
    return `${completionRate}%`;
  } catch (error) {
    console.error("Error calculating phase completion rate:", error);
    return 'N/A';
  }
};

export const getWorkOrdersByStatus = async () => {
  const { data, error } = await supabase
    .from('work_order_status_counts')
    .select('*')
    .order('count', { ascending: false });

  if (error) {
    console.error('Error fetching work order status counts:', error);
    return [];
  }

  return data.map(row => ({
    name: row.status,
    value: row.count
  }));
};
