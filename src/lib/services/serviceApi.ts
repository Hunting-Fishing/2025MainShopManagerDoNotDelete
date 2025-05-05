
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

// Simulated API endpoints for services management
// In a real application, these would make actual API calls

// Mock data storage (replace with actual API calls in production)
let serviceCategories: ServiceMainCategory[] = [
  {
    id: 'cat1',
    name: 'Regular Maintenance',
    description: 'Standard vehicle maintenance services',
    subcategories: [
      {
        id: 'sub1',
        name: 'Oil Services',
        jobs: [
          { id: 'job1', name: 'Standard Oil Change', estimatedTime: 30, price: 45.99 },
          { id: 'job2', name: 'Synthetic Oil Change', estimatedTime: 30, price: 75.99 },
          { id: 'job3', name: 'Oil Filter Replacement', estimatedTime: 15, price: 20.00 }
        ]
      },
      {
        id: 'sub2',
        name: 'Filter Services',
        jobs: [
          { id: 'job4', name: 'Air Filter Replacement', estimatedTime: 15, price: 25.99 },
          { id: 'job5', name: 'Cabin Filter Replacement', estimatedTime: 20, price: 35.99 },
          { id: 'job6', name: 'Fuel Filter Replacement', estimatedTime: 45, price: 85.50 }
        ]
      }
    ]
  },
  {
    id: 'cat2',
    name: 'Brake Services',
    description: 'Complete brake system maintenance and repair',
    subcategories: [
      {
        id: 'sub3',
        name: 'Brake Pads',
        jobs: [
          { id: 'job7', name: 'Front Brake Pad Replacement', estimatedTime: 60, price: 150.00 },
          { id: 'job8', name: 'Rear Brake Pad Replacement', estimatedTime: 60, price: 150.00 },
          { id: 'job9', name: 'Complete Brake Pad Replacement', estimatedTime: 120, price: 280.00 }
        ]
      },
      {
        id: 'sub4',
        name: 'Brake Hardware',
        jobs: [
          { id: 'job10', name: 'Brake Caliper Replacement', estimatedTime: 75, price: 210.00 },
          { id: 'job11', name: 'Brake Line Repair', estimatedTime: 90, price: 180.00 },
          { id: 'job12', name: 'Master Cylinder Replacement', estimatedTime: 120, price: 320.00 }
        ]
      }
    ]
  },
  {
    id: 'cat3',
    name: 'Engine Services',
    description: 'Engine diagnostics, repair, and maintenance',
    subcategories: [
      {
        id: 'sub5',
        name: 'Diagnostic Services',
        jobs: [
          { id: 'job13', name: 'Check Engine Light Diagnostic', estimatedTime: 60, price: 120.00 },
          { id: 'job14', name: 'Engine Performance Testing', estimatedTime: 90, price: 180.00 },
          { id: 'job15', name: 'Exhaust System Inspection', estimatedTime: 45, price: 85.00 }
        ]
      },
      {
        id: 'sub6',
        name: 'Timing Services',
        jobs: [
          { id: 'job16', name: 'Timing Belt Replacement', estimatedTime: 180, price: 650.00 },
          { id: 'job17', name: 'Timing Chain Replacement', estimatedTime: 240, price: 950.00 },
          { id: 'job18', name: 'Water Pump Replacement', estimatedTime: 150, price: 450.00 }
        ]
      }
    ]
  }
];

// Helper function to create a delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all service categories
export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  await delay(600); // Simulate API latency
  return [...serviceCategories];
};

// Add a new category
export const addServiceCategory = async (category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory> => {
  await delay(500);
  const newCategory: ServiceMainCategory = {
    ...category,
    id: `cat${Date.now()}`, // Generate unique ID
    subcategories: category.subcategories || []
  };
  
  serviceCategories = [...serviceCategories, newCategory];
  return newCategory;
};

// Update a category
export const updateServiceCategory = async (categoryId: string, updates: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> => {
  await delay(500);
  const index = serviceCategories.findIndex(cat => cat.id === categoryId);
  
  if (index === -1) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  const updatedCategory = {
    ...serviceCategories[index],
    ...updates
  };
  
  serviceCategories = [
    ...serviceCategories.slice(0, index),
    updatedCategory,
    ...serviceCategories.slice(index + 1)
  ];
  
  return updatedCategory;
};

// Update category name
export const updateCategoryName = async (categoryId: string, newName: string): Promise<void> => {
  await delay(300);
  const index = serviceCategories.findIndex(cat => cat.id === categoryId);
  
  if (index === -1) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  serviceCategories = serviceCategories.map(category => {
    if (category.id === categoryId) {
      return {
        ...category,
        name: newName
      };
    }
    return category;
  });
};

// Update subcategory name
export const updateSubcategoryName = async (categoryId: string, subcategoryId: string, newName: string): Promise<void> => {
  await delay(300);
  const categoryIndex = serviceCategories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  const category = serviceCategories[categoryIndex];
  const subcategoryIndex = category.subcategories.findIndex(sub => sub.id === subcategoryId);
  
  if (subcategoryIndex === -1) {
    throw new Error(`Subcategory with ID ${subcategoryId} not found`);
  }
  
  const updatedSubcategories = [...category.subcategories];
  updatedSubcategories[subcategoryIndex] = {
    ...updatedSubcategories[subcategoryIndex],
    name: newName
  };
  
  const updatedCategory = {
    ...category,
    subcategories: updatedSubcategories
  };
  
  serviceCategories = [
    ...serviceCategories.slice(0, categoryIndex),
    updatedCategory,
    ...serviceCategories.slice(categoryIndex + 1)
  ];
};

// Update job name
export const updateJobName = async (categoryId: string, subcategoryId: string, jobId: string, newName: string): Promise<void> => {
  await delay(300);
  const categoryIndex = serviceCategories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  const category = serviceCategories[categoryIndex];
  const subcategoryIndex = category.subcategories.findIndex(sub => sub.id === subcategoryId);
  
  if (subcategoryIndex === -1) {
    throw new Error(`Subcategory with ID ${subcategoryId} not found`);
  }
  
  const subcategory = category.subcategories[subcategoryIndex];
  const jobIndex = subcategory.jobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    throw new Error(`Job with ID ${jobId} not found`);
  }
  
  const updatedJobs = [...subcategory.jobs];
  updatedJobs[jobIndex] = {
    ...updatedJobs[jobIndex],
    name: newName
  };
  
  const updatedSubcategory = {
    ...subcategory,
    jobs: updatedJobs
  };
  
  const updatedSubcategories = [...category.subcategories];
  updatedSubcategories[subcategoryIndex] = updatedSubcategory;
  
  const updatedCategory = {
    ...category,
    subcategories: updatedSubcategories
  };
  
  serviceCategories = [
    ...serviceCategories.slice(0, categoryIndex),
    updatedCategory,
    ...serviceCategories.slice(categoryIndex + 1)
  ];
};

// Delete a category
export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  await delay(500);
  const index = serviceCategories.findIndex(cat => cat.id === categoryId);
  
  if (index === -1) {
    throw new Error(`Category with ID ${categoryId} not found`);
  }
  
  serviceCategories = [
    ...serviceCategories.slice(0, index),
    ...serviceCategories.slice(index + 1)
  ];
};

// Remove duplicate item by ID
export const removeDuplicateItem = async (itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> => {
  await delay(600); // Simulate API latency
  
  if (type === 'category') {
    serviceCategories = serviceCategories.filter(category => category.id !== itemId);
  } else if (type === 'subcategory') {
    serviceCategories = serviceCategories.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(subcategory => subcategory.id !== itemId)
    }));
  } else if (type === 'job') {
    serviceCategories = serviceCategories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job => job.id !== itemId)
      }))
    }));
  }
  
  // Notify the change
  toast.success(`Duplicate ${type} successfully removed`);
};

// Add other service-related functions here
