
import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

// Cache for preventing duplicate requests
let lastFetchTime = 0;
let cachedSectors: ServiceSector[] = [];
const CACHE_DURATION = 30000; // 30 seconds

export async function fetchServiceSectors(): Promise<ServiceSector[]> {
  const now = Date.now();
  
  // Return cached data if recent
  if (cachedSectors.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Returning cached service sectors');
    return cachedSectors;
  }

  try {
    console.log('Fetching service sectors from database...');
    
    const { data: sectors, error: sectorsError } = await supabase
      .from('service_sectors')
      .select(`
        id,
        name,
        description,
        position,
        is_active,
        service_categories!inner (
          id,
          name,
          description,
          position,
          sector_id,
          service_subcategories!inner (
            id,
            name,
            description,
            category_id,
            service_jobs (
              id,
              name,
              description,
              estimated_time,
              price,
              subcategory_id
            )
          )
        )
      `)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (sectorsError) {
      console.error('Error fetching sectors:', sectorsError);
      throw new Error(`Database error: ${sectorsError.message}`);
    }

    if (!sectors || sectors.length === 0) {
      console.log('No sectors found in database');
      cachedSectors = [];
      lastFetchTime = now;
      return [];
    }

    // Transform the data into the expected structure
    const transformedSectors: ServiceSector[] = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      description: sector.description,
      position: sector.position,
      is_active: sector.is_active,
      categories: (sector.service_categories || []).map((category: any) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        position: category.position,
        sector_id: category.sector_id,
        subcategories: (category.service_subcategories || []).map((subcategory: any) => ({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description,
          category_id: subcategory.category_id,
          jobs: (subcategory.service_jobs || []).map((job: any) => ({
            id: job.id,
            name: job.name,
            description: job.description,
            estimatedTime: job.estimated_time,
            price: job.price,
            subcategory_id: job.subcategory_id
          }))
        }))
      }))
    }));

    console.log(`Successfully fetched ${transformedSectors.length} sectors`);
    
    // Update cache
    cachedSectors = transformedSectors;
    lastFetchTime = now;
    
    return transformedSectors;
    
  } catch (error) {
    console.error('Error in fetchServiceSectors:', error);
    
    // Return cached data as fallback if available
    if (cachedSectors.length > 0) {
      console.log('Returning cached data due to error');
      return cachedSectors;
    }
    
    throw error;
  }
}

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    const sectors = await fetchServiceSectors();
    return sectors.flatMap(sector => sector.categories);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
}

// Clear cache function for after imports
export function clearServiceCache() {
  cachedSectors = [];
  lastFetchTime = 0;
  console.log('Service cache cleared');
}

// Validate service data structure
export function validateServiceData(sectors: ServiceSector[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!Array.isArray(sectors)) {
    errors.push('Sectors must be an array');
    return { isValid: false, errors };
  }
  
  sectors.forEach((sector, sectorIndex) => {
    if (!sector.id || !sector.name) {
      errors.push(`Sector ${sectorIndex + 1}: Missing id or name`);
    }
    
    if (!Array.isArray(sector.categories)) {
      errors.push(`Sector ${sector.name}: Categories must be an array`);
      return;
    }
    
    sector.categories.forEach((category, categoryIndex) => {
      if (!category.id || !category.name) {
        errors.push(`Sector ${sector.name}, Category ${categoryIndex + 1}: Missing id or name`);
      }
      
      if (!Array.isArray(category.subcategories)) {
        errors.push(`Category ${category.name}: Subcategories must be an array`);
        return;
      }
      
      category.subcategories.forEach((subcategory, subcategoryIndex) => {
        if (!subcategory.id || !subcategory.name) {
          errors.push(`Category ${category.name}, Subcategory ${subcategoryIndex + 1}: Missing id or name`);
        }
        
        if (!Array.isArray(subcategory.jobs)) {
          errors.push(`Subcategory ${subcategory.name}: Jobs must be an array`);
        }
      });
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
