
import { supabase } from "@/integrations/supabase/client";
import { ProductCategory } from "@/types/shopping";

export async function getCategories(): Promise<ProductCategory[]> {
  try {
    console.log("Starting getCategories service call");
    
    // Using any type to work around TypeScript issues with Supabase client
    const { data, error } = await (supabase as any)
      .from('product_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    // Add debug log to see what categories are returned
    console.log("Raw categories data from database:", data);
    
    if (!data || data.length === 0) {
      console.log("No categories found in the database");
      return [];
    }

    // Organize categories into a hierarchy
    const mainCategories: ProductCategory[] = [];
    const subCategories: ProductCategory[] = [];

    data.forEach((category: ProductCategory) => {
      // Log each category to help with debugging
      console.log(`Processing category: ${category.name}, slug: ${category.slug}, id: ${category.id}`);
      
      if (!category.parent_id) {
        category.subcategories = [];
        mainCategories.push(category);
      } else {
        subCategories.push(category);
      }
    });

    // Assign subcategories to their parent categories
    subCategories.forEach((subCategory) => {
      const parent = mainCategories.find(cat => cat.id === subCategory.parent_id);
      if (parent) {
        if (!parent.subcategories) {
          parent.subcategories = [];
        }
        parent.subcategories.push(subCategory);
      } else {
        console.warn(`Parent category not found for subcategory: ${subCategory.name} (ID: ${subCategory.id}, Parent ID: ${subCategory.parent_id})`);
      }
    });

    console.log(`Returning ${mainCategories.length} main categories with ${subCategories.length} subcategories`);
    return mainCategories;
  } catch (error) {
    console.error("Error in getCategories service call:", error);
    return []; // Return an empty array instead of throwing, to prevent UI breakage
  }
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  if (!slug) {
    console.warn("getCategoryBySlug called with empty slug");
    return null;
  }
  
  try {
    console.log(`DB Query: Fetching category with slug: "${slug}"`);
    
    const { data, error } = await (supabase as any)
      .from('product_categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found
    
    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "not found" which we handle separately
        console.error("Error fetching category:", error);
        throw error;
      }
    }
    
    if (!data) {
      console.log(`DB Result: No category found with slug: "${slug}"`);
      return null;
    }
    
    console.log(`DB Result: Found category for slug "${slug}":`, data);
    return data;
  } catch (err) {
    console.error(`Error fetching category with slug "${slug}":`, err);
    throw err;
  }
}

export async function createCategory(category: Partial<ProductCategory>): Promise<ProductCategory> {
  // Generate a slug if not provided
  if (!category.slug && category.name) {
    const { slugify } = await import('@/utils/slugUtils');
    category.slug = slugify(category.name);
  }
  
  const { data, error } = await (supabase as any)
    .from('product_categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    throw error;
  }

  return data;
}

export async function updateCategory(id: string, category: Partial<ProductCategory>): Promise<ProductCategory> {
  // Update slug if name is updated and slug isn't specified
  if (category.name && !category.slug) {
    const { slugify } = await import('@/utils/slugUtils');
    category.slug = slugify(category.name);
  }

  const { data, error } = await (supabase as any)
    .from('product_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    throw error;
  }

  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await (supabase as any)
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
}
