
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types/shopping';
import { getCategories, getCategoryBySlug } from '@/services/shopping/categoryService';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandling';

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        console.log("Fetching all categories");
        const data = await getCategories();
        console.log(`Fetched ${data.length} categories:`, data);
        setCategories(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error("Error loading categories:", errorMessage);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast({
          title: "Error loading categories",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const getCategoryById = (id: string): ProductCategory | undefined => {
    // Search in main categories
    const mainCategory = categories.find(cat => cat.id === id);
    if (mainCategory) return mainCategory;

    // Search in subcategories
    for (const category of categories) {
      if (category.subcategories) {
        const subCategory = category.subcategories.find(sub => sub.id === id);
        if (subCategory) return subCategory;
      }
    }

    return undefined;
  };

  const fetchCategoryBySlug = async (slug: string): Promise<ProductCategory | null> => {
    if (!slug) {
      console.warn("fetchCategoryBySlug called with empty slug");
      return null;
    }
    
    try {
      console.log(`Fetching category with slug: "${slug}"`);
      
      // First, try to find in already loaded categories to avoid an extra API call
      const existingCategory = findCategoryBySlug(slug);
      if (existingCategory) {
        console.log(`Found category "${slug}" in existing data:`, existingCategory);
        return existingCategory;
      }
      
      // If not found in existing data, query the database
      console.log(`Category "${slug}" not found in existing data, querying database`);
      const result = await getCategoryBySlug(slug);
      
      if (result) {
        console.log(`Found category by slug "${slug}" in database:`, result);
      } else {
        console.log(`No category found with slug: "${slug}" in database`);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Error fetching category with slug "${slug}":`, errorMessage);
      handleApiError(err, "Error loading category");
      return null;
    }
  };
  
  // Helper function to find a category by slug in the already loaded categories
  const findCategoryBySlug = (slug: string): ProductCategory | null => {
    // Search in main categories
    const mainCategory = categories.find(cat => cat.slug === slug);
    if (mainCategory) return mainCategory;

    // Search in subcategories
    for (const category of categories) {
      if (category.subcategories) {
        const subCategory = category.subcategories.find(sub => sub.slug === slug);
        if (subCategory) return subCategory;
      }
    }

    return null;
  };

  return { 
    categories, 
    isLoading, 
    error, 
    getCategoryById,
    fetchCategoryBySlug,
    findCategoryBySlug
  };
}
