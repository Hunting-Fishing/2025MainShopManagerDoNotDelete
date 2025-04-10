
export interface RecentWorkOrder {
  id: string;
  customer: string;
  service: string;
  status: string;
  date: string;
  priority: string;
}

export interface EquipmentRecommendation {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  maintenanceDate: string;
  maintenanceType: string;
  status: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface DashboardStats {
  activeWorkOrders: string;
  workOrderChange: string;
  teamMembers: string;
  teamChange: string;
  inventoryItems: string;
  inventoryChange: string;
  avgCompletionTime: string;
  completionTimeChange: string;
}

export interface TechnicianPerformance {
  chartData: any[];
  technicians: string[];
}
