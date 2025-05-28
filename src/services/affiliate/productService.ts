
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
      name: product.name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'Uncategorized',
      manufacturer: product.brand || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      tier: product.tier || 'standard',
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
      name: product.name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      category: product.category || 'Uncategorized',
      manufacturer: product.brand || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      tier: product.tier || 'standard',
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

// Add missing functions for useProductsManager
export const getProductsByManufacturer = async (manufacturer: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('brand', manufacturer)
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
      manufacturer: product.brand || manufacturer,
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      tier: product.tier || 'standard',
      featured: product.featured || false,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
    }));
  } catch (error) {
    console.error('Error fetching products by manufacturer:', error);
    return [];
  }
};

export const getProductsByFeaturedGroup = async (groupId: string): Promise<ProductData[]> => {
  // Mock implementation since featured groups aren't in current schema
  console.log('Featured group query not implemented:', groupId);
  return [];
};

export const updateProduct = async (product: any): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        brand: product.manufacturer,
        image_url: product.image_url,
        affiliate_link: product.affiliate_link,
        tier: product.tier,
        featured: product.featured
      })
      .eq('id', product.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || 'Unnamed Product',
      slug: data.slug || data.id,
      description: data.description || '',
      price: data.price || 0,
      category: data.category || 'Uncategorized',
      manufacturer: data.brand || 'Unknown',
      image_url: data.image_url || '',
      affiliate_link: data.affiliate_link || '',
      tier: data.tier || 'standard',
      featured: data.featured || false,
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      is_approved: data.is_approved || false,
      is_available: data.is_available || false
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const createProduct = async (product: Partial<ProductData>): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: product.name || 'New Product',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || 'Uncategorized',
        brand: product.manufacturer || 'Unknown',
        image_url: product.image_url || '',
        affiliate_link: product.affiliate_link || '',
        tier: product.tier || 'standard',
        featured: product.featured || false,
        is_approved: false,
        is_available: true
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || 'Unnamed Product',
      slug: data.slug || data.id,
      description: data.description || '',
      price: data.price || 0,
      category: data.category || 'Uncategorized',
      manufacturer: data.brand || 'Unknown',
      image_url: data.image_url || '',
      affiliate_link: data.affiliate_link || '',
      tier: data.tier || 'standard',
      featured: data.featured || false,
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      is_approved: data.is_approved || false,
      is_available: data.is_available || false
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Add missing analytics tracking function
export const trackProductAnalytics = async (data: any): Promise<void> => {
  try {
    console.log('Product analytics tracked:', data);
    // Mock implementation since product_analytics table doesn't exist
  } catch (error) {
    console.error('Error tracking product analytics:', error);
  }
};
