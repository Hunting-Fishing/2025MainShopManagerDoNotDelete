
// Base types
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

// Product analytics specific types
export interface ProductAnalytics {
  id: string;
  product_id: string;
  product_name: string;
  interaction_type: string;
  category: string;
  created_at: string;
  user_id?: string;
  additional_data?: Record<string, any>;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueViews: number;
  totalClicks: number;
  clickThroughRate: number;
  totalSaves: number;
  saveRate: number;
}

export interface TopProductAnalytics {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
  views?: number;
  clicks?: number;
  saves?: number;
  ctr?: number; // Click-through rate
  viewToSaveRate?: number;
}

export interface CategoryAnalytics {
  name: string;
  views: number;
  clicks: number;
  saves: number;
  products: number;
  averageViewsPerProduct: number;
}

// Product analytics data hook interface
export interface ProductAnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalSaved: number;
  conversionRate: number;
  categoryData: { name: string; count: number }[];
  interactionData: {
    name: string;
    views: number;
    clicks: number;
    saves: number;
    shares: number;
  }[];
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  count: number;
  percentage: number;
}
