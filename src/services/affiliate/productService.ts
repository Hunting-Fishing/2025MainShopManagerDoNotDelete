
import { supabase } from '@/lib/supabase';

export interface ProductData {
  id: string;
  product_name: string;
  description: string;
  price: number;
  image_url: string;
  product_category: string;
  brand: string;
  affiliate_link: string;
  average_rating: number;
  review_count: number;
  product_tier: string;
  featured: boolean;
  is_approved: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  slug?: string;
}

export const getProductsByCategory = async (categoryName: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .eq('is_available', true)
      .ilike('product_category', `%${categoryName}%`);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      price: product.price || 0,
      description: product.description || '',
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || manufacturer || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      product_tier: product.product_tier || 'standard',
      featured: product.featured || false,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      is_approved: product.is_approved,
      is_available: product.is_available,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const getProductsByManufacturer = async (manufacturerName: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .eq('is_available', true)
      .ilike('brand', `%${manufacturerName}%`);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      price: product.price || 0,
      description: product.description || '',
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || manufacturerName || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      product_tier: product.product_tier || 'standard',
      featured: product.featured || false,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      is_approved: product.is_approved,
      is_available: product.is_available,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Error fetching products by manufacturer:', error);
    throw error;
  }
};

export const getProductsByFeaturedGroup = async (groupId: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .eq('is_available', true)
      .eq('featured', true);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      price: product.price || 0,
      description: product.description || '',
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || 'Unknown',
      image_url: product.image_url || '',
      affiliate_link: product.affiliate_link || '',
      product_tier: product.product_tier || 'standard',
      featured: product.featured || false,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      is_approved: product.is_approved,
      is_available: product.is_available,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const updateProduct = async (product: any): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        product_name: product.name || product.product_name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl || product.image_url,
        product_category: product.category || product.product_category,
        brand: product.manufacturer || product.brand,
        affiliate_link: product.affiliateLink || product.affiliate_link,
        product_tier: product.tier || product.product_tier,
        featured: product.featured
      })
      .eq('id', product.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      product_name: data.product_name || 'Unnamed Product',
      slug: data.slug || data.id,
      price: data.price || 0,
      description: data.description || '',
      product_category: data.product_category || 'Uncategorized',
      brand: data.brand || 'Unknown',
      image_url: data.image_url || '',
      affiliate_link: data.affiliate_link || '',
      product_tier: data.product_tier || 'standard',
      featured: data.featured || false,
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      is_approved: data.is_approved,
      is_available: data.is_available,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const createProduct = async (product: any): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        product_name: product.name || 'Unnamed Product',
        description: product.description || '',
        price: product.price || 0,
        image_url: product.imageUrl || '',
        product_category: product.category || 'Uncategorized',
        brand: product.manufacturer || 'Unknown',
        affiliate_link: product.affiliateLink || '',
        product_tier: product.tier || 'standard',
        featured: product.featured || false,
        is_approved: true,
        is_available: true
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      product_name: data.product_name || 'Unnamed Product',
      slug: data.slug || data.id,
      price: data.price || 0,
      description: data.description || '',
      product_category: data.product_category || 'Uncategorized',
      brand: data.brand || 'Unknown',
      image_url: data.image_url || '',
      affiliate_link: data.affiliate_link || '',
      product_tier: data.product_tier || 'standard',
      featured: data.featured || false,
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      is_approved: data.is_approved,
      is_available: data.is_available,
      created_at: data.created_at,
      updated_at: data.updated_at
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

export const trackProductAnalytics = async (data: any): Promise<void> => {
  console.log('Tracking product analytics:', data);
  // This is a placeholder for analytics tracking
  // In a real implementation, you would save this to an analytics table
};
