import { supabase } from '@/lib/supabase';

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_link: string;
  category: string;
  manufacturer: string;
  average_rating: number;
  review_count: number;
  product_type: string;
  featured: boolean;
  is_approved: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const getProducts = async (): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .eq('is_available', true);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      name: product.name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || 'Unknown',
      rating: product.average_rating || 0,
      reviewCount: product.review_count || 0,
      imageUrl: product.image_url || '',
      tier: product.product_type || 'standard',
      featured: product.featured || false,
      affiliateLink: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      bestSeller: false,
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductsByCategory = async (category: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_approved', true)
      .eq('is_available', true);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      name: product.name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || 'Unknown',
      rating: product.average_rating || 0,
      reviewCount: product.review_count || 0,
      imageUrl: product.image_url || '',
      tier: product.product_type || 'standard',
      featured: product.featured || false,
      affiliateLink: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      bestSeller: false,
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .eq('is_approved', true)
      .eq('is_available', true)
      .limit(8);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      name: product.name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || 'Unknown',
      rating: product.average_rating || 0,
      reviewCount: product.review_count || 0,
      imageUrl: product.image_url || '',
      tier: product.product_type || 'standard',
      featured: product.featured || false,
      affiliateLink: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      bestSeller: false,
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const trackProductAnalytics = async (data: any) => {
  try {
    console.log('Tracking product analytics:', data);
    // This is a placeholder for analytics tracking
    // In a real implementation, you would store this data in an analytics table
    return { success: true };
  } catch (error) {
    console.error('Error tracking product analytics:', error);
    throw error;
  }
};
