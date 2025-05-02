
import { AffiliateTool, AffiliateProduct } from "@/types/affiliate";
import { supabase } from "@/lib/supabase";

/**
 * Get products by category
 * @param category Category name
 * @returns Array of products in the category
 */
export const getProductsByCategory = async (category: string): Promise<AffiliateTool[]> => {
  console.log(`Fetching products for category: ${category}`);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error("Error fetching products by category:", error);
      throw error;
    }
    
    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      slug: product.slug,
      price: product.price,
      salePrice: product.sale_price,
      imageUrl: product.image_url,
      category: product.category,
      subcategory: product.subcategory,
      manufacturer: product.manufacturer,
      rating: product.rating,
      reviewCount: product.review_count,
      featured: product.featured,
      bestSeller: product.best_seller,
      affiliateLink: product.affiliate_link,
      seller: product.seller
    })) as AffiliateTool[];
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    // Return empty array on error
    return [];
  }
};

/**
 * Get products by manufacturer
 * @param manufacturer Manufacturer name
 * @returns Array of products from the manufacturer
 */
export const getProductsByManufacturer = async (manufacturer: string): Promise<AffiliateTool[]> => {
  console.log(`Fetching products for manufacturer: ${manufacturer}`);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('manufacturer', manufacturer);
    
    if (error) {
      console.error("Error fetching products by manufacturer:", error);
      throw error;
    }
    
    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      slug: product.slug,
      price: product.price,
      salePrice: product.sale_price,
      imageUrl: product.image_url,
      category: product.category,
      subcategory: product.subcategory,
      manufacturer: product.manufacturer,
      rating: product.rating,
      reviewCount: product.review_count,
      featured: product.featured,
      bestSeller: product.best_seller,
      affiliateLink: product.affiliate_link,
      seller: product.seller
    })) as AffiliateTool[];
  } catch (error) {
    console.error("Error in getProductsByManufacturer:", error);
    return [];
  }
};

/**
 * Get products by featured group
 * @param groupId Featured group ID
 * @returns Array of products in the featured group
 */
export const getProductsByFeaturedGroup = async (groupId: string): Promise<AffiliateTool[]> => {
  console.log(`Fetching products for featured group: ${groupId}`);
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true);
    
    if (error) {
      console.error("Error fetching featured products:", error);
      throw error;
    }
    
    return data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      slug: product.slug,
      price: product.price,
      salePrice: product.sale_price,
      imageUrl: product.image_url,
      category: product.category,
      subcategory: product.subcategory,
      manufacturer: product.manufacturer,
      rating: product.rating,
      reviewCount: product.review_count,
      featured: product.featured,
      bestSeller: product.best_seller,
      affiliateLink: product.affiliate_link,
      seller: product.seller
    })) as AffiliateTool[];
  } catch (error) {
    console.error("Error in getProductsByFeaturedGroup:", error);
    return [];
  }
};

/**
 * Update a product
 * @param product Product to update
 * @returns Updated product
 */
export const updateProduct = async (product: AffiliateTool | AffiliateProduct): Promise<AffiliateTool | AffiliateProduct> => {
  console.log(`Updating product: ${product.id}`, product);
  
  try {
    // Normalize product data for database
    const updateData: any = {
      id: product.id
    };
    
    // Handle AffiliateTool type
    if ('name' in product) updateData.name = product.name;
    if ('description' in product) updateData.description = product.description;
    if ('slug' in product) updateData.slug = product.slug;
    if ('category' in product) updateData.category = product.category;
    if ('manufacturer' in product) updateData.manufacturer = product.manufacturer;
    
    // Handle price fields - determine which price field is used
    if ('price' in product) updateData.price = product.price;
    else if ('retailPrice' in product) updateData.price = product.retailPrice;
    
    // Handle sale price
    if ('salePrice' in product) updateData.sale_price = product.salePrice;
    
    // Handle image URL fields
    if ('imageUrl' in product) updateData.image_url = product.imageUrl;
    
    // Handle affiliate link fields
    if ('affiliateLink' in product) updateData.affiliate_link = product.affiliateLink;
    else if ('affiliateUrl' in product) updateData.affiliate_link = product.affiliateUrl;
    
    // Handle featured and bestseller flags
    if ('featured' in product) updateData.featured = product.featured;
    if ('bestSeller' in product) updateData.best_seller = product.bestSeller;
    if ('isFeatured' in product) updateData.featured = product.isFeatured;
    if ('bestSeller' in product) updateData.best_seller = product.bestSeller;
    
    // Update product in database
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', product.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }
    
    // Convert database record back to AffiliateTool format
    const updatedProduct: AffiliateTool = {
      id: data.id,
      name: data.name,
      description: data.description || '',
      slug: data.slug,
      price: data.price,
      salePrice: data.sale_price,
      imageUrl: data.image_url,
      category: data.category,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      rating: data.rating,
      reviewCount: data.review_count,
      featured: data.featured,
      bestSeller: data.best_seller,
      affiliateLink: data.affiliate_link,
      seller: data.seller
    };
    
    return updatedProduct;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    // Return original product on error
    return product;
  }
};

/**
 * Get price history for a product
 * @param productId Product ID
 * @returns Array of price history entries
 */
export const getProductPriceHistory = async (productId: string): Promise<any[]> => {
  console.log(`Fetching price history for product: ${productId}`);
  
  try {
    // This would be replaced with an actual query to price history table
    // For now, return mock data until we create a price history table
    return [
      { date: "2025-04-01", price: 129.99, salePrice: 99.99 },
      { date: "2025-03-01", price: 139.99, salePrice: 109.99 },
      { date: "2025-02-01", price: 149.99, salePrice: null },
    ];
  } catch (error) {
    console.error("Error fetching product price history:", error);
    return [];
  }
};

/**
 * Get all product submissions
 * @returns Array of product submissions
 */
export const getProductSubmissions = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('product_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching product submissions:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getProductSubmissions:", error);
    return [];
  }
};

/**
 * Update submission status
 * @param submissionId Submission ID
 * @param status New status
 * @returns Updated submission
 */
export const updateSubmissionStatus = async (submissionId: string, status: string, notes?: string): Promise<any> => {
  try {
    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    
    const { data, error } = await supabase
      .from('product_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating submission status:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateSubmissionStatus:", error);
    throw error;
  }
};

/**
 * Track product analytics
 * @param analyticsData Analytics data
 */
export const trackProductAnalytics = async (analyticsData: {
  productId: string;
  productName: string;
  category: string;
  interactionType: string;
  additionalData?: any;
}): Promise<void> => {
  try {
    const { error } = await supabase
      .from('product_analytics')
      .insert({
        product_id: analyticsData.productId,
        product_name: analyticsData.productName,
        category: analyticsData.category,
        interaction_type: analyticsData.interactionType,
        user_id: undefined, // This would be filled with auth.user().id if authentication is implemented
        additional_data: analyticsData.additionalData || {}
      });
      
    if (error) {
      console.error("Error tracking product analytics:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in trackProductAnalytics:", error);
  }
};

/**
 * Get all categories
 * @returns Array of product categories
 */
export const getCategories = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*');
      
    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
};

/**
 * Get all manufacturers
 * @returns Array of manufacturers
 */
export const getManufacturers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*');
      
    if (error) {
      console.error("Error fetching manufacturers:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getManufacturers:", error);
    return [];
  }
};

/**
 * Create a new product
 * @param product Product to create
 * @returns Created product
 */
export const createProduct = async (product: Partial<AffiliateTool>): Promise<AffiliateTool> => {
  try {
    // Map the product to the database schema
    const productData = {
      name: product.name,
      description: product.description,
      slug: product.slug || product.name?.toLowerCase().replace(/\s+/g, '-'),
      price: product.price,
      sale_price: product.salePrice,
      image_url: product.imageUrl,
      category: product.category,
      subcategory: product.subcategory,
      manufacturer: product.manufacturer,
      rating: product.rating || 0,
      review_count: product.reviewCount || 0,
      featured: product.featured || false,
      best_seller: product.bestSeller || false,
      affiliate_link: product.affiliateLink || '',
      seller: product.seller
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
      
    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }
    
    // Map the database record back to AffiliateTool format
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      slug: data.slug,
      price: data.price,
      salePrice: data.sale_price,
      imageUrl: data.image_url,
      category: data.category,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      rating: data.rating,
      reviewCount: data.review_count,
      featured: data.featured,
      bestSeller: data.best_seller,
      affiliateLink: data.affiliate_link,
      seller: data.seller
    } as AffiliateTool;
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error;
  }
};

/**
 * Submit a product for review
 * @param submission Submission data
 * @returns Created submission
 */
export const submitProduct = async (submission: {
  productName: string;
  productUrl: string;
  suggestedCategory: string;
  notes?: string;
}): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('product_submissions')
      .insert({
        product_name: submission.productName,
        product_url: submission.productUrl,
        suggested_category: submission.suggestedCategory,
        notes: submission.notes,
        status: 'pending'
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error submitting product:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in submitProduct:", error);
    throw error;
  }
};

/**
 * Delete a product
 * @param productId Product ID
 * @returns void
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error;
  }
};
