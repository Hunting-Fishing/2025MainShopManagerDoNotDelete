
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
