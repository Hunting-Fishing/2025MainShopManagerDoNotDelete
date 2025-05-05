
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';

// Create a new empty service category
export const createEmptyCategory = (name: string = 'New Category'): ServiceMainCategory => {
  return {
    id: uuidv4(),
    name,
    description: '',
    subcategories: [],
    position: 0
  };
};

// Create a new empty subcategory
export const createEmptySubcategory = (name: string = 'New Subcategory'): ServiceSubcategory => {
  return {
    id: uuidv4(),
    name,
    description: '',
    jobs: []
  };
};

// Create a new empty job
export const createEmptyJob = (name: string = 'New Service'): ServiceJob => {
  return {
    id: uuidv4(),
    name,
    description: '',
    estimatedTime: 30, // Default 30 minutes
    price: 0
  };
};

// Find a category by ID
export const findCategory = (
  categories: ServiceMainCategory[],
  categoryId: string
): ServiceMainCategory | undefined => {
  return categories.find((category) => category.id === categoryId);
};

// Find a subcategory by ID
export const findSubcategory = (
  categories: ServiceMainCategory[],
  categoryId: string,
  subcategoryId: string
): ServiceSubcategory | undefined => {
  const category = findCategory(categories, categoryId);
  if (!category) return undefined;
  
  return category.subcategories.find((sub) => sub.id === subcategoryId);
};

// Find a job by ID
export const findJob = (
  categories: ServiceMainCategory[],
  categoryId: string,
  subcategoryId: string,
  jobId: string
): ServiceJob | undefined => {
  const subcategory = findSubcategory(categories, categoryId, subcategoryId);
  if (!subcategory) return undefined;
  
  return subcategory.jobs.find((job) => job.id === jobId);
};

// Count total services across all categories
export const countTotalServices = (categories: ServiceMainCategory[]): number => {
  return categories.reduce((total, category) => {
    return (
      total +
      category.subcategories.reduce((subTotal, subcategory) => {
        return subTotal + subcategory.jobs.length;
      }, 0)
    );
  }, 0);
};

// Group services by estimated time for analytics
export const groupServicesByTime = (categories: ServiceMainCategory[]): Record<string, number> => {
  const timeGroups: Record<string, number> = {
    'Under 15 min': 0,
    '15-30 min': 0,
    '30-60 min': 0,
    '1-2 hours': 0,
    'Over 2 hours': 0
  };
  
  categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.jobs.forEach((job) => {
        const time = job.estimatedTime || 0;
        
        if (time < 15) timeGroups['Under 15 min']++;
        else if (time < 30) timeGroups['15-30 min']++;
        else if (time < 60) timeGroups['30-60 min']++;
        else if (time < 120) timeGroups['1-2 hours']++;
        else timeGroups['Over 2 hours']++;
      });
    });
  });
  
  return timeGroups;
};

// Calculate price ranges for services
export const calculatePriceRanges = (categories: ServiceMainCategory[]): Record<string, number> => {
  const priceRanges: Record<string, number> = {
    'Free': 0,
    'Under $50': 0,
    '$50-$100': 0,
    '$100-$250': 0,
    '$250-$500': 0,
    'Over $500': 0
  };
  
  categories.forEach((category) => {
    category.subcategories.forEach((subcategory) => {
      subcategory.jobs.forEach((job) => {
        const price = job.price || 0;
        
        if (price === 0) priceRanges['Free']++;
        else if (price < 50) priceRanges['Under $50']++;
        else if (price < 100) priceRanges['$50-$100']++;
        else if (price < 250) priceRanges['$100-$250']++;
        else if (price < 500) priceRanges['$250-$500']++;
        else priceRanges['Over $500']++;
      });
    });
  });
  
  return priceRanges;
};
