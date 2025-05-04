
import { v4 as uuidv4 } from 'uuid';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

// Format time from minutes to readable format
export const formatTime = (minutes: number): string => {
  if (!minutes) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

// Creates an empty service job
export const createEmptyJob = (): ServiceJob => ({
  id: uuidv4(),
  name: 'New Service',
  description: '',
  estimatedTime: 30,
  price: 0
});

// Creates an empty subcategory with an option for initial jobs
export const createEmptySubcategory = (includeInitialJob: boolean = true): ServiceSubcategory => ({
  id: uuidv4(),
  name: 'New Subcategory',
  description: '',
  jobs: includeInitialJob ? [createEmptyJob()] : []
});

// Creates an empty main category with position
export const createEmptyCategory = (position: number): ServiceMainCategory => ({
  id: uuidv4(),
  name: 'New Category',
  description: '',
  position,
  subcategories: [createEmptySubcategory()]
});

// Validates a service job
export const validateJob = (job: ServiceJob): boolean => {
  return !!job.name.trim();
};

// Validates a subcategory
export const validateSubcategory = (subcategory: ServiceSubcategory): boolean => {
  return !!subcategory.name.trim();
};

// Validates a main category
export const validateCategory = (category: ServiceMainCategory): boolean => {
  return !!category.name.trim();
};

// Generates a unique ID
export const generateId = (): string => {
  return uuidv4();
};

// Shallow clone an object
export const clone = <T>(obj: T): T => {
  return { ...obj };
};

// Deep clone an object
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Sort categories by position
export const sortCategoriesByPosition = (categories: ServiceMainCategory[]): ServiceMainCategory[] => {
  return [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));
};

