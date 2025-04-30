
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { ProductCategory } from '@/types/shopping';
import { normalizeSlug } from '@/utils/slugUtils';

export function useCategoryDetail(slug: string | undefined) {
  const { categories, fetchCategoryBySlug, isLoading: categoriesLoading } = useCategories();
  const { products, isLoading: productsLoading, filterOptions, updateFilters } = useProducts();
  
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [similarCategories, setSimilarCategories] = useState<ProductCategory[]>([]);
  const [retries, setRetries] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false); // Track if we've already fetched data

  useEffect(() => {
    // Reset state when the slug changes
    if (!slug) {
      setError("No category specified");
      setIsLoading(false);
      return;
    }
    
    // If we already have the correct category, don't refetch
    if (category && category.slug === slug) {
      console.log(`Category ${slug} already loaded, skipping fetch`);
      return;
    }
    
    const fetchCategory = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching category for slug: ${slug}`);
        
        // First check if the category is in the already loaded categories
        const existingCategory = categories.find(c => c.slug === slug);
        
        if (existingCategory) {
          console.log(`Found category "${slug}" in existing data:`, existingCategory);
          setCategory(existingCategory);
          updateFilters({ categoryId: existingCategory.id });
          setIsLoading(false);
          setHasFetched(true);
          return;
        }
        
        // If not found in memory, try the normalized slug
        const normalizedSlug = normalizeSlug(slug);
        
        // Try to find the category by normalized slug
        let categoryData = await fetchCategoryBySlug(normalizedSlug);
        
        // If we couldn't find it, try with the original slug
        if (!categoryData && normalizedSlug !== slug) {
          console.log(`Trying with original slug: ${slug}`);
          categoryData = await fetchCategoryBySlug(slug);
        }
        
        if (categoryData) {
          console.log("Category found:", categoryData);
          setCategory(categoryData);
          updateFilters({ categoryId: categoryData.id });
        } else {
          // Find similar categories for suggestions
          const slugParts = slug.split('-');
          
          const similar = categories.filter(cat => {
            if (!cat.slug) return false;
            return slugParts.some(part => 
              cat.slug.includes(part) && part.length > 2
            );
          });
          
          console.log(`No category found for slug "${slug}", found ${similar.length} similar categories`);
          setSimilarCategories(similar);
          
          if (similar.length > 0) {
            setError(`Category "${slug}" not found. Did you mean one of these?`);
          } else {
            setError(`Category "${slug}" not found.`);
          }
          
          setDiagnosticInfo(`
            We couldn't find a category with the slug "${slug}". 
            ${categories.length > 0 
              ? `There are ${categories.length} categories in the database.` 
              : "There are no categories in the database yet."}
            ${categories.length > 0 
              ? `Available categories: ${categories.map(c => c.slug).join(', ')}` 
              : ""}
            This could be because:
            - The category doesn't exist in the database
            - The slug is misspelled or formatted differently
            - The database isn't properly connected
          `);
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError(err instanceof Error ? err.message : "Failed to load category");
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    // Only fetch if we haven't already fetched or the slug has changed
    if (!hasFetched || category?.slug !== slug) {
      fetchCategory();
    }
  }, [slug, fetchCategoryBySlug, categories, updateFilters, retries, category, hasFetched]);

  const handleRetry = () => setRetries(r => r + 1);

  return {
    category,
    products,
    isLoading: isLoading || categoriesLoading,
    productsLoading,
    error,
    filterOptions,
    similarCategories,
    diagnosticInfo,
    handleRetry,
    updateFilters
  };
}
