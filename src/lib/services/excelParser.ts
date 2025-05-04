
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { v4 as uuidv4 } from 'uuid';

// Helper functions to parse Excel data
export const parseExcelData = (data: any[]): ServiceMainCategory[] => {
  const categories: ServiceMainCategory[] = [];
  
  try {
    // Expects data in a specific format with these columns:
    // Category, Subcategory, Job Name, Job Description, Time (min), Price
    
    data.forEach((row, index) => {
      if (index === 0) return; // Skip header row
      
      // Check if row has required data
      if (!row.Category || !row.Subcategory || !row['Job Name']) {
        console.warn('Skipping row with missing required data:', row);
        return;
      }
      
      const categoryName = row.Category.trim();
      const subcategoryName = row.Subcategory.trim();
      const jobName = row['Job Name'].trim();
      const jobDescription = row['Job Description'] || '';
      const estimatedTime = parseInt(row['Time (min)']) || 0;
      const price = parseFloat(row.Price) || 0;
      
      // Find or create category
      let category = categories.find(c => c.name === categoryName);
      if (!category) {
        category = {
          id: uuidv4(),
          name: categoryName,
          description: '',
          position: categories.length,
          subcategories: []
        };
        categories.push(category);
      }
      
      // Find or create subcategory
      let subcategory = category.subcategories.find(s => s.name === subcategoryName);
      if (!subcategory) {
        subcategory = {
          id: uuidv4(),
          name: subcategoryName,
          description: '',
          jobs: []
        };
        category.subcategories.push(subcategory);
      }
      
      // Create job
      const job: ServiceJob = {
        id: uuidv4(),
        name: jobName,
        description: jobDescription,
        estimatedTime,
        price
      };
      
      subcategory.jobs.push(job);
    });
    
    return categories;
  } catch (error) {
    console.error('Error parsing Excel data:', error);
    throw new Error('Failed to parse Excel data. Please check the format.');
  }
};
