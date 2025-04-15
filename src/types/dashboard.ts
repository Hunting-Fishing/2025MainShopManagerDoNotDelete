
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
  customerSatisfaction: string;
  schedulingEfficiency: string;
  phaseCompletionRate: string;
  qualityControlPassRate: string;
}

export interface ChecklistStat {
  name: string;
  completionRate: number;
  lastUpdated: string;
}
