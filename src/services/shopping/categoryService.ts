import { supabase } from "@/integrations/supabase/client";
import { ProductCategory } from "@/types/shopping";

export async function getCategories(): Promise<ProductCategory[]> {
  try {
    // Using any type to work around TypeScript issues with Supabase client
    const { data, error } = await (supabase as any)
      .from('product_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }

    // Organize categories into a hierarchy
    const mainCategories: ProductCategory[] = [];
    const subCategories: ProductCategory[] = [];

    data.forEach((category: ProductCategory) => {
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
      }
    });

    return mainCategories;
  } catch (error) {
    console.error("Error in getCategories:", error);
    return []; // Return an empty array instead of throwing, to prevent UI breakage
  }
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
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
