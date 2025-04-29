import { supabase } from "@/integrations/supabase/client";
import { Product, ProductFilterOptions } from "@/types/shopping";

export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    let query = supabase.from('products').select('*');

    // Apply filters
    if (options.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }

    if (options.search) {
      query = query.ilike('title', `%${options.search}%`);
    }

    if (options.minPrice !== undefined) {
      query = query.gte('price', options.minPrice);
    }

    if (options.maxPrice !== undefined) {
      query = query.lte('price', options.maxPrice);
    }

    // Apply filter type
    if (options.filterType) {
      switch(options.filterType) {
        case 'bestsellers':
          query = query.eq('is_bestseller', true);
          break;
        case 'featured':
          query = query.eq('is_featured', true);
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'suggested':
          query = query.eq('product_type', 'suggested');
          break;
      }
    }

    // Apply sorting
    if (options.sortBy) {
      switch(options.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'popularity':
        default:
          // We'll use is_bestseller as an indicator of popularity
          query = query.order('is_bestseller', { ascending: false })
                       .order('average_rating', { ascending: false });
          break;
      }
    }

    // Only return approved products in normal view
    query = query.eq('is_approved', true);

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProducts:", error);
    return []; 
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Error in getProductById:", error);
    return null;
  }
}

export async function getUserSuggestions(includeUnapproved: boolean = false): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('product_type', 'suggested');

    if (!includeUnapproved) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching user suggestions:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUserSuggestions:", error);
    return [];
  }
}

export async function submitProductSuggestion(suggestion: Partial<Product>): Promise<Product> {
  try {
    // Make sure title is provided
    if (!suggestion.title) {
      throw new Error("Title is required for product suggestions");
    }
    
    // Set default values for required fields
    const productSuggestion = {
      title: suggestion.title, 
      category_id: suggestion.category_id || 'default', 
      product_type: 'suggested' as const,
      is_approved: false,
      is_featured: false,
      is_bestseller: false,
      image_url: suggestion.image_url || null, // Make sure to include the image URL
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...suggestion,
    };

    // Log the submission for debugging
    console.log("Submitting product suggestion:", productSuggestion);

    const { data, error } = await supabase
      .from('products')
      .insert(productSuggestion)
      .select()
      .single();

    if (error) {
      console.error("Error submitting product suggestion:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in submitProductSuggestion:", error);
    throw error;
  }
}

// Add the missing functions that are being imported by admin components

export async function createProduct(product: Partial<Product> & { title: string; category_id: string }): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error;
  }
}

export async function approveProductSuggestion(id: string): Promise<Product> {
  try {
    const { data, error } = await supabase
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
  } catch (error) {
    console.error("Error in approveProductSuggestion:", error);
    throw error;
  }
}

export async function getProductReviews(productId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, profiles:user_id(username, avatar_url)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching product reviews:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    return [];
  }
}

// Add a new function to extract images from Amazon product links
export async function extractAmazonProductInfo(amazonUrl: string): Promise<Partial<Product> | null> {
  try {
    // This would normally be an edge function call
    // For now, we'll just return a placeholder
    console.log("Extracting Amazon product info for:", amazonUrl);
    
    // In a real implementation, we would call an edge function:
    // const { data, error } = await supabase.functions.invoke('extract-amazon-product-info', {
    //   body: { amazonUrl }
    // });
    
    return null;
  } catch (error) {
    console.error("Error extracting Amazon product info:", error);
    return null;
  }
}

// Add a new function to approve a suggested product
export async function approveSuggestion(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_approved: true })
      .eq('id', id);
    
    if (error) {
      console.error("Error approving product suggestion:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in approveSuggestion:", error);
    return false;
  }
}

// Add a new function to reject a suggested product
export async function rejectSuggestion(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('product_type', 'suggested');
    
    if (error) {
      console.error("Error rejecting product suggestion:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error in rejectSuggestion:", error);
    return false;
  }
}
