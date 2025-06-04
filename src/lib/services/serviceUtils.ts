
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';

// Search service categories
export const searchServiceCategories = (
  categories: ServiceMainCategory[],
  query: string
): ServiceMainCategory[] => {
  if (!query.trim()) return categories;

  const lowerQuery = query.toLowerCase();
  
  return categories.map(category => {
    const matchingSubcategories = category.subcategories.map(subcategory => {
      const matchingJobs = subcategory.jobs.filter(job =>
        job.name.toLowerCase().includes(lowerQuery) ||
        (job.description && job.description.toLowerCase().includes(lowerQuery))
      );

      if (matchingJobs.length > 0) {
        return {
          ...subcategory,
          jobs: matchingJobs
        };
      }

      // Check if subcategory name matches
      if (subcategory.name.toLowerCase().includes(lowerQuery)) {
        return subcategory;
      }

      return null;
    }).filter(Boolean);

    // Check if category name matches
    if (category.name.toLowerCase().includes(lowerQuery) || matchingSubcategories.length > 0) {
      return {
        ...category,
        subcategories: matchingSubcategories.length > 0 ? matchingSubcategories : category.subcategories
      };
    }

    return null;
  }).filter(Boolean) as ServiceMainCategory[];
};

// Search all jobs across categories
export const searchAllJobs = (
  categories: ServiceMainCategory[],
  query: string
): ServiceJob[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const allJobs: ServiceJob[] = [];

  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        if (
          job.name.toLowerCase().includes(lowerQuery) ||
          (job.description && job.description.toLowerCase().includes(lowerQuery))
        ) {
          allJobs.push(job);
        }
      });
    });
  });

  return allJobs;
};

// Get service job by ID
export const getServiceJobById = (
  categories: ServiceMainCategory[],
  jobId: string
): ServiceJob | null => {
  for (const category of categories) {
    for (const subcategory of category.subcategories) {
      const job = subcategory.jobs.find(j => j.id === jobId);
      if (job) return job;
    }
  }
  return null;
};

// Get all jobs flattened
export const getAllJobs = (categories: ServiceMainCategory[]): ServiceJob[] => {
  return categories.flatMap(category =>
    category.subcategories.flatMap(subcategory => subcategory.jobs)
  );
};
