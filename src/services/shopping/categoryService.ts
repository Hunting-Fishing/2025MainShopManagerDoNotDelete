import { supabase } from "@/integrations/supabase/client";
import { ProductCategory } from "@/types/shopping";

export async function getCategories(): Promise<ProductCategory[]> {
  try {
    console.log("Fetching categories from database...");
    // Using any type to work around TypeScript issues with Supabase client
    const { data, error } = await (supabase as any)
      .from('product_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data.length} categories`);

    // Organize categories into a proper hierarchy
    const categoriesMap: Record<string, ProductCategory> = {};
    const mainCategories: ProductCategory[] = [];

    // First pass: create all category objects with empty subcategories arrays
    data.forEach((category: ProductCategory) => {
      categoriesMap[category.id] = {
        ...category,
        subcategories: []
      };
    });

    // Second pass: build the hierarchy
    data.forEach((category: ProductCategory) => {
      if (!category.parent_id) {
        // This is a main category
        mainCategories.push(categoriesMap[category.id]);
      } else if (categoriesMap[category.parent_id]) {
        // This is a subcategory, add it to its parent
        categoriesMap[category.parent_id].subcategories!.push(categoriesMap[category.id]);
      } else {
        // Parent doesn't exist, add as a main category as fallback
        console.warn(`Parent category ${category.parent_id} not found for ${category.name}`);
        mainCategories.push(categoriesMap[category.id]);
      }
    });

    // Sort subcategories by name for better organization
    const sortSubcategories = (categories: ProductCategory[]) => {
      for (const category of categories) {
        if (category.subcategories && category.subcategories.length > 0) {
          category.subcategories.sort((a, b) => a.name.localeCompare(b.name));
          sortSubcategories(category.subcategories);
        }
      }
    };

    sortSubcategories(mainCategories);
    mainCategories.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Structured into ${mainCategories.length} main categories with subcategories`);
    return mainCategories;
  } catch (error) {
    console.error("Error in getCategories:", error);
    throw error; // Throw the error to be handled by the caller
  }
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
  try {
    const { data, error } = await (supabase as any)
      .from('product_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Category not found
      }
      console.error("Error fetching category:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    throw error;
  }
}

export async function createCategory(category: Partial<ProductCategory>): Promise<ProductCategory> {
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
