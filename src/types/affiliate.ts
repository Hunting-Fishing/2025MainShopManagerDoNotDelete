
export type ProductTier = 'premium' | 'midgrade' | 'economy';

export interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  tier: ProductTier;
  category: string;
  retailPrice: number;
  affiliateUrl: string;
  source: 'amazon' | 'other';
  isFeatured?: boolean;
  isSaved?: boolean;
  rating?: number;
  reviewCount?: number;
  discount?: number;
  stockQuantity?: number;
  freeShipping?: boolean;
  bestSeller?: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  slug: string;
  subcategories?: string[];
}

export interface AffiliateLink {
  id: string;
  productId: string;
  url: string;
  trackingId: string;
  createdAt: string;
}

export interface UserSubmission {
  id: string;
  productName: string;
  productUrl: string;
  suggestedCategory: string;
  notes?: string;
  submittedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  verified: boolean;
  helpful: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductWarranty {
  type: string;
  duration: string;
  coverage: string[];
  exclusions: string[];
}
