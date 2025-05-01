
export interface AnalyticsData {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  featuredProducts: number;
  totalCategories: number;
  totalManufacturers: number;
  totalSubmissions: number;
  productsByCategory: { name: string; count: number }[];
  productsByManufacturer: { name: string; count: number }[];
  submissionStatusData: { name: string; value: number }[];
}
