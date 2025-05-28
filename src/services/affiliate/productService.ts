
import { supabase } from '@/lib/supabase';

export interface ProductData {
  id: string;
  product_name: string;
  description: string;
  price: number;
  image_url: string;
  affiliate_link: string;
  product_category: string;
  brand: string;
  average_rating: number;
  review_count: number;
  product_type: string;
  featured: boolean;
  is_approved: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  subcategory?: string;
  seller?: string;
  tags?: string[];
  slug?: string;
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
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || 'Unknown',
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      image_url: product.image_url || '',
      product_type: product.product_type || 'standard',
      featured: product.featured || false,
      affiliate_link: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
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
      .eq('product_category', category)
      .eq('is_approved', true)
      .eq('is_available', true);

    if (error) throw error;

    return (data || []).map(product => ({
      id: product.id,
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || 'Unknown',
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      image_url: product.image_url || '',
      product_type: product.product_type || 'standard',
      featured: product.featured || false,
      affiliate_link: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

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
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || 'Unknown',
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      image_url: product.image_url || '',
      product_type: product.product_type || 'standard',
      featured: product.featured || false,
      affiliate_link: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
    }));
  } catch (error) {
    console.error('Error fetching products by manufacturer:', error);
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
      product_name: product.product_name || 'Unnamed Product',
      slug: product.slug || product.id,
      description: product.description || '',
      price: product.price || 0,
      product_category: product.product_category || 'Uncategorized',
      brand: product.brand || 'Unknown',
      average_rating: product.average_rating || 0,
      review_count: product.review_count || 0,
      image_url: product.image_url || '',
      product_type: product.product_type || 'standard',
      featured: product.featured || false,
      affiliate_link: product.affiliate_link || '',
      subcategory: product.subcategory,
      seller: product.seller || 'Unknown',
      tags: product.tags || [],
      created_at: product.created_at,
      updated_at: product.updated_at,
      is_approved: product.is_approved || false,
      is_available: product.is_available || false
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const getProductsByFeaturedGroup = async (groupId: string): Promise<ProductData[]> => {
  // For now, return featured products - this can be expanded later
  return getFeaturedProducts();
};

export const createProduct = async (productData: Partial<ProductData>): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        product_name: productData.product_name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url,
        affiliate_link: productData.affiliate_link,
        product_category: productData.product_category,
        brand: productData.brand,
        product_type: productData.product_type || 'standard',
        featured: productData.featured || false,
        is_approved: false,
        is_available: true
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      product_name: data.product_name || 'Unnamed Product',
      slug: data.slug || data.id,
      description: data.description || '',
      price: data.price || 0,
      product_category: data.product_category || 'Uncategorized',
      brand: data.brand || 'Unknown',
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      image_url: data.image_url || '',
      product_type: data.product_type || 'standard',
      featured: data.featured || false,
      affiliate_link: data.affiliate_link || '',
      subcategory: data.subcategory,
      seller: data.seller || 'Unknown',
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_approved: data.is_approved || false,
      is_available: data.is_available || false
    };
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<ProductData>): Promise<ProductData> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        product_name: productData.product_name,
        description: productData.description,
        price: productData.price,
        image_url: productData.image_url,
        affiliate_link: productData.affiliate_link,
        product_category: productData.product_category,
        brand: productData.brand,
        product_type: productData.product_type,
        featured: productData.featured
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      product_name: data.product_name || 'Unnamed Product',
      slug: data.slug || data.id,
      description: data.description || '',
      price: data.price || 0,
      product_category: data.product_category || 'Uncategorized',
      brand: data.brand || 'Unknown',
      average_rating: data.average_rating || 0,
      review_count: data.review_count || 0,
      image_url: data.image_url || '',
      product_type: data.product_type || 'standard',
      featured: data.featured || false,
      affiliate_link: data.affiliate_link || '',
      subcategory: data.subcategory,
      seller: data.seller || 'Unknown',
      tags: data.tags || [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_approved: data.is_approved || false,
      is_available: data.is_available || false
    };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
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
