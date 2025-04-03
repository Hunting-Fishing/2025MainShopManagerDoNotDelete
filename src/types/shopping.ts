
export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  subcategories?: ProductCategory[];
}

export interface Product {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  price?: number;
  affiliate_link?: string;
  tracking_params?: string;
  category_id: string;
  product_type: 'affiliate' | 'suggested';
  is_featured: boolean;
  is_bestseller: boolean;
  is_approved: boolean;
  suggested_by?: string;
  suggestion_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export type ProductFilterOptions = {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  filterType?: 'all' | 'bestsellers' | 'featured' | 'newest' | 'suggested';
  sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'newest';
};
