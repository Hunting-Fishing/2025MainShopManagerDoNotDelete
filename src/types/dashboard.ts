
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

export interface PhaseProgressItem {
  id: string;
  name: string;
  completedPhases: number;
  totalPhases: number;
  progress: number;
}

export interface ServiceTypeData {
  subject: string;
  value: number;
}

export interface TechnicianPerformanceData {
  technicians: string[];
  chartData: TechnicianPerformance[];
}

export interface TechnicianPerformance {
  month: string;
  [technician: string]: string | number;
}

export interface TechnicianEfficiencyData {
  id: string;
  name: string;
  totalHours: number;
  billableHours: number;
  efficiency: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
}

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
  status: string;
  maintenanceType: string;
  maintenanceDate: string;
  priority: "High" | "Medium" | "Low";
}

