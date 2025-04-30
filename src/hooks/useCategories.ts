
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types/shopping';
import { getCategories, getCategoryBySlug } from '@/services/shopping/categoryService';
import { toast } from '@/hooks/use-toast';

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
    try {
      console.log(`Fetching category with slug: "${slug}"`);
      const result = await getCategoryBySlug(slug);
      if (result) {
        console.log(`Found category by slug "${slug}":`, result);
      } else {
        console.log(`No category found with slug: "${slug}"`);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Error fetching category with slug "${slug}":`, errorMessage);
      toast({
        title: "Error loading category",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    }
  };

  return { 
    categories, 
    isLoading, 
    error, 
    getCategoryById,
    fetchCategoryBySlug
  };
}
