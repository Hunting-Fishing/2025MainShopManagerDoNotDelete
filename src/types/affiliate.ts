
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
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  slug: string;
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
