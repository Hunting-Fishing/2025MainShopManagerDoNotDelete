
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

export interface ServiceTypeData {
  subject: string;
  value: number;
}

export interface TechnicianPerformance {
  name: string;
  completedOrders: number;
  averageTime: number;
  customerRating: number;
}

export interface TechnicianPerformanceData {
  technicians: string[];
  chartData: Array<{
    month: string;
    [key: string]: string | number;
  }>;
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
