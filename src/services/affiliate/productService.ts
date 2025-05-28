
import { supabase } from '@/lib/supabase';

export interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  manufacturer: string;
  average_rating: number;
  review_count: number;
  affiliate_link: string;
  tier: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const getProductsByCategory = async (categoryName: string): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_approved', true)
      .eq('is_available', true)
      .ilike('category', `%${categoryName}%`);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      name: product.name || product.title || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      image_url: product.image_url || '',
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || product.brand || 'Unknown',
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      affiliate_link: product.affiliate_link || '',
      tier: product.product_type || 'standard',
      featured: product.featured || false,
      created_at: product.created_at || '',
      updated_at: product.updated_at || product.created_at || ''
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
      .or(`manufacturer.ilike.%${manufacturerName}%,brand.ilike.%${manufacturerName}%`);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      name: product.name || product.title || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      image_url: product.image_url || '',
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || product.brand || manufacturerName,
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      affiliate_link: product.affiliate_link || '',
      tier: product.product_type || 'standard',
      featured: product.featured || false,
      created_at: product.created_at || '',
      updated_at: product.updated_at || product.created_at || ''
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
      name: product.name || product.title || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      image_url: product.image_url || '',
      category: product.category || 'Uncategorized',
      manufacturer: product.manufacturer || product.brand || 'Unknown',
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      affiliate_link: product.affiliate_link || '',
      tier: product.product_type || 'standard',
      featured: product.featured || false,
      created_at: product.created_at || '',
      updated_at: product.updated_at || product.created_at || ''
    }));
  } catch (error) {
    console.error('Error fetching products by featured group:', error);
    throw error;
  }
};

export const updateProduct = async (updatedProduct: any): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category,
        manufacturer: updatedProduct.manufacturer,
        featured: updatedProduct.featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedProduct.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || 'Unnamed Product',
      slug: data.slug || data.id,
      description: data.description || '',
      price: data.price || 0,
      image_url: data.image_url || '',
      category: data.category || 'Uncategorized',
      manufacturer: data.manufacturer || data.brand || 'Unknown',
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      affiliate_link: data.affiliate_link || '',
      tier: data.product_type || 'standard',
      featured: data.featured || false,
      created_at: data.created_at || '',
      updated_at: data.updated_at || ''
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
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        manufacturer: product.manufacturer,
        featured: product.featured || false,
        is_approved: true,
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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
      image_url: data.image_url || '',
      category: data.category || 'Uncategorized',
      manufacturer: data.manufacturer || 'Unknown',
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      affiliate_link: data.affiliate_link || '',
      tier: data.product_type || 'standard',
      featured: data.featured || false,
      created_at: data.created_at || '',
      updated_at: data.updated_at || ''
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

export const trackProductAnalytics = async (productId: string, interactionType: string): Promise<void> => {
  try {
    // Mock implementation for analytics tracking
    console.log(`Tracking ${interactionType} for product ${productId}`);
  } catch (error) {
    console.error('Error tracking product analytics:', error);
  }
};
