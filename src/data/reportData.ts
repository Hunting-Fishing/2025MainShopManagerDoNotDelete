
import { useReportData } from "@/hooks/useReportData";

// This file now re-exports the hook that fetches data from the database
export { useReportData };

// For backwards compatibility with any code that imports directly
// Export an empty reportData object as fallback
export const reportData = {
  salesData: [],
  workOrderStatusData: [],
  topSellingItems: [],
  servicePerformance: [],
  comparisonRevenueData: [],
  comparisonServiceData: [],
  inventoryData: {
    statusData: [],
    turnoverData: [],
    lowStockItems: []
  }
};
