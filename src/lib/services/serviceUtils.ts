
import { v4 as uuidv4 } from 'uuid';
import { ServiceMainCategory } from "@/types/serviceHierarchy";

// Create a new empty category with default values
export function createEmptyCategory(position: number = 0): ServiceMainCategory {
  return {
    id: uuidv4(),
    name: "New Category",
    description: "",
    position,
    subcategories: []
  };
}

// Format time in minutes to a human-readable format (e.g., "1h 30m")
export function formatTime(minutes: number | undefined): string {
  if (!minutes) return "N/A";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Utility to deep clone a category
export function cloneCategory(category: ServiceMainCategory): ServiceMainCategory {
  return JSON.parse(JSON.stringify(category));
}

// Get a flattened list of all services from a category
export function getAllServices(category: ServiceMainCategory): { 
  categoryName: string, 
  subcategoryName: string, 
  service: string 
}[] {
  const result: { categoryName: string, subcategoryName: string, service: string }[] = [];
  
  category.subcategories.forEach(subcategory => {
    subcategory.jobs.forEach(job => {
      result.push({
        categoryName: category.name,
        subcategoryName: subcategory.name,
        service: job.name
      });
    });
  });
  
  return result;
}
