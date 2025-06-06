
import { supabase } from '@/integrations/supabase/client';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceSectors = async (): Promise<ServiceSector[]> => {
  try {
    console.log('Fetching service sectors...');

    // First, fetch all sectors
    const { data: sectorsData, error: sectorsError } = await supabase
      .from('service_sectors')
      .select('*')
      .order('position', { ascending: true });

    if (sectorsError) {
      console.error('Error fetching sectors:', sectorsError);
      throw new Error(`Failed to fetch sectors: ${sectorsError.message}`);
    }

    console.log(`Found ${sectorsData?.length || 0} sectors`);

    if (!sectorsData || sectorsData.length === 0) {
      return [];
    }

    // Fetch all categories for all sectors in one query
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .in('sector_id', sectorsData.map(s => s.id))
      .order('position', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    console.log(`Found ${categoriesData?.length || 0} categories`);

    // Fetch all subcategories for all categories in one query
    const categoryIds = categoriesData?.map(c => c.id) || [];
    let subcategoriesData: any[] = [];
    if (categoryIds.length > 0) {
      const { data, error: subcategoriesError } = await supabase
        .from('service_subcategories')
        .select('*')
        .in('category_id', categoryIds)
        .order('created_at', { ascending: true });

      if (subcategoriesError) {
        console.error('Error fetching subcategories:', subcategoriesError);
        throw new Error(`Failed to fetch subcategories: ${subcategoriesError.message}`);
      }

      subcategoriesData = data || [];
    }

    console.log(`Found ${subcategoriesData.length} subcategories`);

    // Fetch all jobs for all subcategories in one query
    const subcategoryIds = subcategoriesData.map(sc => sc.id);
    let jobsData: any[] = [];
    if (subcategoryIds.length > 0) {
      const { data, error: jobsError } = await supabase
        .from('service_jobs')
        .select('*')
        .in('subcategory_id', subcategoryIds)
        .order('created_at', { ascending: true });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
      }

      jobsData = data || [];
    }

    console.log(`Found ${jobsData.length} jobs`);

    // Build the hierarchical structure
    const sectors: ServiceSector[] = sectorsData.map(sector => {
      const sectorCategories = categoriesData?.filter(cat => cat.sector_id === sector.id) || [];
      
      const categories: ServiceMainCategory[] = sectorCategories.map(category => {
        const categorySubcategories = subcategoriesData.filter(sub => sub.category_id === category.id);
        
        const subcategories: ServiceSubcategory[] = categorySubcategories.map(subcategory => {
          const subcategoryJobs = jobsData.filter(job => job.subcategory_id === subcategory.id);
          
          const jobs: ServiceJob[] = subcategoryJobs.map(job => ({
            id: job.id,
            name: job.name,
            description: job.description,
            estimatedTime: job.estimated_time,
            price: job.price,
            subcategory_id: job.subcategory_id
          }));

          return {
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            jobs,
            category_id: subcategory.category_id
          };
        });

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          subcategories,
          position: category.position,
          sector_id: category.sector_id
        };
      });

      return {
        id: sector.id,
        name: sector.name,
        description: sector.description,
        categories,
        position: sector.position,
        is_active: sector.is_active !== false
      };
    });

    console.log(`Built hierarchy with ${sectors.length} sectors`);
    sectors.forEach(sector => {
      const totalCategories = sector.categories.length;
      const totalSubcategories = sector.categories.reduce((acc, cat) => acc + cat.subcategories.length, 0);
      const totalJobs = sector.categories.reduce((acc, cat) => 
        acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0);
      
      console.log(`Sector "${sector.name}": ${totalCategories} categories, ${totalSubcategories} subcategories, ${totalJobs} jobs`);
    });

    return sectors;
  } catch (error) {
    console.error('Error in fetchServiceSectors:', error);
    throw error;
  }
};

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Fetching service categories...');

    // Get all categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .order('position', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    if (!categoriesData || categoriesData.length === 0) {
      return [];
    }

    // Get all subcategories for these categories
    const categoryIds = categoriesData.map(c => c.id);
    const { data: subcategoriesData, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('*')
      .in('category_id', categoryIds)
      .order('created_at', { ascending: true });

    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      throw new Error(`Failed to fetch subcategories: ${subcategoriesError.message}`);
    }

    // Get all jobs for these subcategories
    const subcategoryIds = subcategoriesData?.map(sc => sc.id) || [];
    let jobsData: any[] = [];
    if (subcategoryIds.length > 0) {
      const { data, error: jobsError } = await supabase
        .from('service_jobs')
        .select('*')
        .in('subcategory_id', subcategoryIds)
        .order('created_at', { ascending: true });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        throw new Error(`Failed to fetch jobs: ${jobsError.message}`);
      }

      jobsData = data || [];
    }

    // Build the hierarchical structure
    const categories: ServiceMainCategory[] = categoriesData.map(category => {
      const categorySubcategories = subcategoriesData?.filter(sub => sub.category_id === category.id) || [];
      
      const subcategories: ServiceSubcategory[] = categorySubcategories.map(subcategory => {
        const subcategoryJobs = jobsData.filter(job => job.subcategory_id === subcategory.id);
        
        const jobs: ServiceJob[] = subcategoryJobs.map(job => ({
          id: job.id,
          name: job.name,
          description: job.description,
          estimatedTime: job.estimated_time,
          price: job.price,
          subcategory_id: job.subcategory_id
        }));

        return {
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description,
          jobs,
          category_id: subcategory.category_id
        };
      });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        subcategories,
        position: category.position,
        sector_id: category.sector_id
      };
    });

    console.log(`Fetched ${categories.length} categories with hierarchy`);
    return categories;
  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    throw error;
  }
};
