
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const findServiceById = (categories: ServiceMainCategory[], serviceId: string): ServiceJob | null => {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const job = subcategory.jobs.find(job => job.id === serviceId);
      if (job) return job;
    }
  }
  return null;
};

export const findServicePath = (
  categories: ServiceMainCategory[], 
  serviceId: string
): { category: ServiceMainCategory; subcategory: ServiceSubcategory; job: ServiceJob } | null => {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const job = subcategory.jobs.find(job => job.id === serviceId);
      if (job) {
        return { category, subcategory, job };
      }
    }
  }
  return null;
};

export const searchServices = (
  categories: ServiceMainCategory[], 
  searchTerm: string
): ServiceJob[] => {
  const results: ServiceJob[] = [];
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      for (const job of subcategory.jobs) {
        if (
          job.name.toLowerCase().includes(lowerSearchTerm) ||
          (job.description && job.description.toLowerCase().includes(lowerSearchTerm))
        ) {
          results.push(job);
        }
      }
    }
  }
  
  return results;
};

export const getServicesByCategory = (
  categories: ServiceMainCategory[], 
  categoryId: string
): ServiceJob[] => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return [];
  
  return category.subcategories.flatMap(sub => sub.jobs);
};

export const getServicesBySubcategory = (
  categories: ServiceMainCategory[], 
  subcategoryId: string
): ServiceJob[] => {
  for (const category of categories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (subcategory) return subcategory.jobs;
  }
  return [];
};

export const formatServicePrice = (price?: number): string => {
  if (!price) return 'Contact for pricing';
  return `$${price.toFixed(2)}`;
};

export const formatEstimatedTime = (minutes?: number): string => {
  if (!minutes) return 'Contact for time estimate';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};
