
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

  useEffect(() => {
    // Reset state when the slug changes
    setIsLoading(true);
    setError(null);
    setCategory(null);
    setSimilarCategories([]);
    setDiagnosticInfo(null);
    
    // If no slug is provided, show an error
    if (!slug) {
      setError("No category specified");
      setIsLoading(false);
      return;
    }
    
    const fetchCategory = async () => {
      try {
        console.log(`Fetching category for slug: ${slug}`);
        
        // Try to normalize the slug (remove or standardize special characters)
        const normalizedSlug = normalizeSlug(slug);
        console.log(`Normalized slug: ${normalizedSlug}`);
        console.log(`Available categories:`, categories.map(c => ({id: c.id, name: c.name, slug: c.slug})));
        
        // First, try to find the category by normalized slug
        let categoryData = await fetchCategoryBySlug(normalizedSlug);
        
        // If we couldn't find it, try with the original slug
        if (!categoryData && normalizedSlug !== slug) {
          console.log(`Trying with original slug: ${slug}`);
          categoryData = await fetchCategoryBySlug(slug);
        }
        
        // If we found a category, use it
        if (categoryData) {
          console.log("Category found:", categoryData);
          setCategory(categoryData);
          updateFilters({ categoryId: categoryData.id });
        } else {
          // If not found, find similar categories for suggestions
          const slugParts = slug.split('-');
          
          // Look for categories that match any part of the slug
          const similar = categories.filter(cat => {
            if (!cat.slug) return false;
            return slugParts.some(part => 
              cat.slug.includes(part) && part.length > 2
            );
          });
          
          console.log(`No category found for slug "${slug}", found ${similar.length} similar categories`);
          setSimilarCategories(similar);
          
          // If we have similar categories, suggest them
          if (similar.length > 0) {
            setError(`Category "${slug}" not found. Did you mean one of these?`);
          } else {
            setError(`Category "${slug}" not found.`);
          }
          
          // Add diagnostic information
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
      }
    };

    fetchCategory();
  }, [slug, fetchCategoryBySlug, categories, updateFilters, retries]);

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
