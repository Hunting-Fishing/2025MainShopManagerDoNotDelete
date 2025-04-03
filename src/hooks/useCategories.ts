
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
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
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
      return await getCategoryBySlug(slug);
    } catch (err) {
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
