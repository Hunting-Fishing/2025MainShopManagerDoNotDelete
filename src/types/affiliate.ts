
export type ManufacturerCategory = 
  | 'automotive'
  | 'heavy-duty'
  | 'equipment'
  | 'marine'
  | 'atv-utv'
  | 'motorcycle';

export interface Manufacturer {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: ManufacturerCategory;
  logoUrl?: string;
  websiteUrl?: string;
  featured?: boolean;
  productCount?: number;
}

export interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  subcategories?: string[];
  imageUrl?: string;
  featured?: boolean;
  productCount?: number;
}

export interface AffiliateTool {
  id: string;
  name: string;
  description: string;
  slug: string;
  price?: number;
  salePrice?: number;
  imageUrl?: string;
  category: string;
  subcategory?: string;
  manufacturer: string;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  bestSeller?: boolean;
  affiliateLink: string;
  seller?: string;
}

export interface ToolSubmission {
  id: string;
  toolName: string;
  manufacturerName: string;
  category: string;
  subcategory?: string;
  description?: string;
  imageUrl?: string;
  suggestedPrice?: number;
  submitterEmail: string;
  submitterName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'modifications';
  submissionDate: string;
  notes?: string;
}

export interface FeaturedGroup {
  id: string;
  name: string;
  description: string;
  slug: string;
  toolIds: string[];
  priority: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}
