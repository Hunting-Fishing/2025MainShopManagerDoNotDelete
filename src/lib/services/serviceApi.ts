
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { createEmptyCategory, createEmptySubcategory, createEmptyJob } from './serviceUtils';

// Fetch service categories from API
export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  // In a real application, this would call an API
  // For now, return mock data
  return Promise.resolve([
    {
      id: 'cat1',
      name: 'Engine Services',
      description: 'Services related to engine maintenance and repair',
      subcategories: [
        {
          id: 'sub1',
          name: 'Oil Services',
          description: 'Oil change and related services',
          jobs: [
            {
              id: 'job1',
              name: 'Standard Oil Change',
              description: 'Replace oil and filter with standard oil',
              estimatedTime: 30,
              price: 39.99
            },
            {
              id: 'job2',
              name: 'Synthetic Oil Change',
              description: 'Replace oil and filter with full synthetic oil',
              estimatedTime: 30,
              price: 59.99
            }
          ]
        },
        {
          id: 'sub2',
          name: 'Engine Repair',
          description: 'Engine repair services',
          jobs: [
            {
              id: 'job3',
              name: 'Engine Diagnostic',
              description: 'Diagnose engine issues',
              estimatedTime: 60,
              price: 89.99
            }
          ]
        }
      ],
      position: 1
    },
    {
      id: 'cat2',
      name: 'Brake Services',
      description: 'Services related to brake maintenance and repair',
      subcategories: [
        {
          id: 'sub3',
          name: 'Brake Pads',
          description: 'Brake pad replacement',
          jobs: [
            {
              id: 'job4',
              name: 'Front Brake Pads',
              description: 'Replace front brake pads',
              estimatedTime: 60,
              price: 149.99
            },
            {
              id: 'job5',
              name: 'Rear Brake Pads',
              description: 'Replace rear brake pads',
              estimatedTime: 60,
              price: 149.99
            }
          ]
        }
      ],
      position: 2
    }
  ]);
}

// Update service item name (category, subcategory, or job)
export async function updateServiceItemName(
  itemId: string, 
  newName: string, 
  type: 'category' | 'subcategory' | 'job'
): Promise<boolean> {
  console.log(`Updating ${type} ${itemId} with new name: ${newName}`);
  // In a real app, this would call an API to update the database
  // For now, just return success
  return Promise.resolve(true);
}

// Delete a service item (category, subcategory, or job)
export async function deleteServiceItem(
  itemId: string, 
  type: 'category' | 'subcategory' | 'job'
): Promise<boolean> {
  console.log(`Deleting ${type} with ID: ${itemId}`);
  // In a real app, this would call an API to update the database
  // For now, just return success
  return Promise.resolve(true);
}

// Add a new subcategory to a category
export async function addSubcategory(
  categoryId: string,
  subcategoryName?: string
): Promise<ServiceSubcategory> {
  console.log(`Adding subcategory to category ${categoryId}`);
  // Create a new empty subcategory
  const newSubcategory = createEmptySubcategory(subcategoryName || 'New Subcategory');
  // In a real app, this would call an API to update the database
  // For now, just return the new subcategory
  return Promise.resolve(newSubcategory);
}

// Add a new job to a subcategory
export async function addJob(
  categoryId: string,
  subcategoryId: string,
  jobName?: string
): Promise<ServiceJob> {
  console.log(`Adding job to subcategory ${subcategoryId} in category ${categoryId}`);
  // Create a new empty job
  const newJob = createEmptyJob(jobName || 'New Service');
  // In a real app, this would call an API to update the database
  // For now, just return the new job
  return Promise.resolve(newJob);
}

// Bulk import service categories
export async function bulkImportServiceCategories(
  data: any[],
  progressCallback?: (progress: number) => void
): Promise<ServiceMainCategory[]> {
  // Simulate processing time
  for (let i = 0; i < 100; i += 10) {
    progressCallback?.(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  progressCallback?.(100);
  
  console.log('Bulk importing service categories:', data);
  // In a real app, this would process the data and call an API
  // For now, just return a success response
  return Promise.resolve([
    {
      id: 'imported1',
      name: 'Imported Category',
      description: 'This was imported from bulk data',
      subcategories: [],
      position: 3
    }
  ]);
}

// Remove a duplicate item from the service hierarchy
export async function removeDuplicateItem(
  itemId: string,
  type: 'category' | 'subcategory' | 'job'
): Promise<boolean> {
  console.log(`Removing duplicate ${type} with ID: ${itemId}`);
  // In a real app, this would call an API to update the database
  // For now, just return success
  return Promise.resolve(true);
}
