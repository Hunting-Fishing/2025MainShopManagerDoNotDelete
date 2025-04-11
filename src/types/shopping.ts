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
  
  stock_quantity?: number;
  sku?: string;
  weight?: number;
  dimensions?: any;
  is_available?: boolean;
  average_rating?: number;
  review_count?: number;
  sale_price?: number;
  sale_start_date?: string;
  sale_end_date?: string;
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

export interface ShoppingCart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: Product;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface CustomerAddress {
  id: string;
  user_id: string;
  address_type: 'shipping' | 'billing' | 'both';
  is_default: boolean;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
