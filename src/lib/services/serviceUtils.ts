
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';

export const findServiceById = (categories: ServiceMainCategory[], serviceId: string): ServiceJob | null => {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const job = subcategory.jobs.find(job => job.id === serviceId);
      if (job) return job;
    }
  }
  return null;
};

export const getTotalServicesCount = (categories: ServiceMainCategory[]): number => {
  return categories.reduce((total, category) => {
    return total + category.subcategories.reduce((subTotal, sub) => {
      return subTotal + sub.jobs.length;
    }, 0);
  }, 0);
};

export const getServicesWithoutPricing = (categories: ServiceMainCategory[]): ServiceJob[] => {
  const servicesWithoutPrice: ServiceJob[] = [];
  
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        if (!job.price || job.price === 0) {
          servicesWithoutPrice.push(job);
        }
      });
    });
  });
  
  return servicesWithoutPrice;
};
