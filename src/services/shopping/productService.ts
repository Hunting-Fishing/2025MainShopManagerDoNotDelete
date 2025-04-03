
import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFilterOptions } from "@/types/shopping";

export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  let query = (supabase as any)
    .from('products')
    .select('*')
    .eq('is_approved', true);

  // Apply filters
  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options.search) {
    query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
  }

  if (options.minPrice !== undefined) {
    query = query.gte('price', options.minPrice);
  }

  if (options.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice);
  }

  if (options.filterType === 'bestsellers') {
    query = query.eq('is_bestseller', true);
  } else if (options.filterType === 'featured') {
    query = query.eq('is_featured', true);
  } else if (options.filterType === 'suggested') {
    query = query.eq('product_type', 'suggested');
  }

  // Apply sorting
  if (options.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true });
  } else if (options.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false });
  } else if (options.sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else {
    // Default sort by popularity (bestsellers first, then featured, then others)
    query = query.order('is_bestseller', { ascending: false })
                 .order('is_featured', { ascending: false })
                 .order('title');
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    throw error;
  }

  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await (supabase as any)
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Product not found
    }
    console.error("Error fetching product:", error);
    throw error;
  }

  return data;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const { data, error } = await (supabase as any)
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }

  return data;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const { data, error } = await (supabase as any)
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function getUserSuggestions(includeUnapproved: boolean = false): Promise<Product[]> {
  let query = (supabase as any)
    .from('products')
    .select('*')
    .eq('product_type', 'suggested');
  
  if (!includeUnapproved) {
    query = query.eq('is_approved', true);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user suggestions:", error);
    throw error;
  }

  return data || [];
}

export async function submitProductSuggestion(suggestion: Partial<Product>): Promise<Product> {
  const productData = {
    ...suggestion,
    product_type: 'suggested',
    is_approved: false,
    suggested_by: (await supabase.auth.getUser()).data.user?.id
  };

  const { data, error } = await (supabase as any)
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    console.error("Error submitting product suggestion:", error);
    throw error;
  }

  return data;
}

export async function approveProductSuggestion(id: string): Promise<Product> {
  const { data, error } = await (supabase as any)
    .from('products')
    .update({ is_approved: true })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error approving product suggestion:", error);
    throw error;
  }

  return data;
}
