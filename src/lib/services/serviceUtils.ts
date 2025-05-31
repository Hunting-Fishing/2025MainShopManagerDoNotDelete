
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

/**
 * Utility functions for working with service data
 */

export function findServiceById(categories: ServiceMainCategory[], serviceId: string): ServiceJob | null {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const job = subcategory.jobs.find(j => j.id === serviceId);
      if (job) return job;
    }
  }
  return null;
}

export function findCategoryById(categories: ServiceMainCategory[], categoryId: string): ServiceMainCategory | null {
  return categories.find(c => c.id === categoryId) || null;
}

export function findSubcategoryById(categories: ServiceMainCategory[], subcategoryId: string): ServiceSubcategory | null {
  for (const category of categories) {
    const subcategory = category.subcategories.find(s => s.id === subcategoryId);
    if (subcategory) return subcategory;
  }
  return null;
}

export function getServicePath(categories: ServiceMainCategory[], serviceId: string): {
  category: ServiceMainCategory;
  subcategory: ServiceSubcategory;
  job: ServiceJob;
} | null {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const job = subcategory.jobs.find(j => j.id === serviceId);
      if (job) {
        return { category, subcategory, job };
      }
    }
  }
  return null;
}

export function searchServices(categories: ServiceMainCategory[], query: string): ServiceJob[] {
  const results: ServiceJob[] = [];
  const searchTerm = query.toLowerCase();

  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      for (const job of subcategory.jobs) {
        if (
          job.name.toLowerCase().includes(searchTerm) ||
          (job.description && job.description.toLowerCase().includes(searchTerm))
        ) {
          results.push(job);
        }
      }
    }
  }

  return results;
}

export function formatPrice(price?: number): string {
  if (!price) return 'Price not set';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
}

export function formatEstimatedTime(minutes?: number): string {
  if (!minutes) return 'Time not set';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}
