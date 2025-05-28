
import { supabase } from '@/lib/supabase';

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  manufacturer: string;
  image_url: string;
  affiliate_link: string;
  tier: string;
  featured: boolean;
  average_rating: number;
  review_count: number;
  is_approved: boolean;
  is_available: boolean;
}

export const getProductsByCategory = async (categoryId: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_approved', true)
      .eq('is_available', true);

    if (error) throw error;

    // Transform database data to match ProductData interface
    return (data || []).map(product => ({
      id: product.id,
      name: product.product_name || 'Unnamed Product',
      slug: product.product_slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.product_category || 'Uncategorized',
      manufacturer: product.brand || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      tier: product.product_tier || 'standard',
      featured: product.featured || false,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
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

    // Transform database data to match ProductData interface
    return (data || []).map(product => ({
      id: product.id,
      name: product.product_name || 'Unnamed Product',
      slug: product.product_slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.product_category || 'Uncategorized',
      manufacturer: product.brand || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      tier: product.product_tier || 'standard',
      featured: product.featured || false,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};
