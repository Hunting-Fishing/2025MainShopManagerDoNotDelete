
export interface DashboardStats {
  revenue: number;
  activeOrders: number;
  customers: number;
  lowStockParts: number;
  activeWorkOrders: string;
  workOrderChange: string;
  teamMembers: string;
  teamChange: string;
  inventoryItems: string;
  inventoryChange: string;
  avgCompletionTime: string;
  completionTimeChange: string;
  customerSatisfaction?: string;
  phaseCompletionRate?: string;
  schedulingEfficiency?: string;
  qualityControlPassRate?: string;
}

export interface PhaseProgressItem {
  id: string;
  name: string;
  totalPhases: number;
  completedPhases: number;
  progress: number;
}

export interface ChecklistStat {
  work_order_id: string;
  checklist_id: string;
  requiredItems: number;
  completedRequiredItems: number;
  completionRate: number;
}

export interface TechnicianEfficiencyData {
  id: string;
  name: string;
  totalHours: number;
  billableHours: number;
  efficiency: number;
}
