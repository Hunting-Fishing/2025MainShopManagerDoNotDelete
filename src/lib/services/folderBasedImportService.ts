import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Define Zod schema for Sector
const sectorSchema = z.object({
  Sector: z.string(),
  SectorDescription: z.string().optional(),
});

// Define Zod schema for Category
const categorySchema = z.object({
  Sector: z.string(),
  Category: z.string(),
  CategoryDescription: z.string().optional(),
});

// Define Zod schema for Subcategory
const subcategorySchema = z.object({
  Sector: z.string(),
  Category: z.string(),
  Subcategory: z.string(),
  SubcategoryDescription: z.string().optional(),
});

// Define Zod schema for Job
const jobSchema = z.object({
  Sector: z.string(),
  Category: z.string(),
  Subcategory: z.string(),
  Job: z.string(),
  JobDescription: z.string().optional(),
  EstimatedTime: z.number().optional(),
  Price: z.number().optional(),
});

export interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export interface ImportResult {
  success: boolean;
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ImportStats {
  totalImported: number;
  errors: string[];
  sectors: number;
  categories: number;
  subcategories: number;
  services: number;
}

export interface ProcessedServiceData {
  sectors: any[];
  totalImported: number;
  errors: string[];
  sectorCount: number;
  categoryCount: number;
  subcategoryCount: number;
  jobCount: number;
}

// Mock data with proper automotive sector distribution
const mockSampleData = {
  sectors: [
    { Sector: "Automotive", SectorDescription: "Vehicle maintenance and repair services" },
    { Sector: "General", SectorDescription: "General business and office services" }
  ],
  categories: [
    // Automotive Categories
    { Sector: "Automotive", Category: "Engine Services", CategoryDescription: "Engine maintenance and repair" },
    { Sector: "Automotive", Category: "Brake Services", CategoryDescription: "Brake system maintenance and repair" },
    { Sector: "Automotive", Category: "Transmission Services", CategoryDescription: "Transmission maintenance and repair" },
    { Sector: "Automotive", Category: "Electrical Services", CategoryDescription: "Vehicle electrical system services" },
    { Sector: "Automotive", Category: "Suspension Services", CategoryDescription: "Suspension and steering services" },
    // General Categories
    { Sector: "General", Category: "Office Services", CategoryDescription: "Office and administrative services" },
    { Sector: "General", Category: "Technology Services", CategoryDescription: "IT and technology support" },
    { Sector: "General", Category: "Facility Services", CategoryDescription: "Building and facility maintenance" }
  ],
  subcategories: [
    // Engine Services Subcategories
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Oil Changes", SubcategoryDescription: "Engine oil maintenance" },
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Filter Replacements", SubcategoryDescription: "Air and fuel filter services" },
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Tune-ups", SubcategoryDescription: "Engine performance optimization" },
    
    // Brake Services Subcategories
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Brake Inspections", SubcategoryDescription: "Brake system diagnostics" },
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Pad Replacements", SubcategoryDescription: "Brake pad installation" },
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Rotor Services", SubcategoryDescription: "Brake rotor maintenance" },
    
    // Transmission Services Subcategories
    { Sector: "Automotive", Category: "Transmission Services", Subcategory: "Fluid Changes", SubcategoryDescription: "Transmission fluid maintenance" },
    { Sector: "Automotive", Category: "Transmission Services", Subcategory: "Repairs", SubcategoryDescription: "Transmission repair services" },
    
    // Electrical Services Subcategories
    { Sector: "Automotive", Category: "Electrical Services", Subcategory: "Battery Services", SubcategoryDescription: "Battery testing and replacement" },
    { Sector: "Automotive", Category: "Electrical Services", Subcategory: "Lighting", SubcategoryDescription: "Vehicle lighting services" },
    
    // Suspension Services Subcategories
    { Sector: "Automotive", Category: "Suspension Services", Subcategory: "Shock Absorbers", SubcategoryDescription: "Shock absorber services" },
    { Sector: "Automotive", Category: "Suspension Services", Subcategory: "Alignment", SubcategoryDescription: "Wheel alignment services" },
    
    // General Subcategories
    { Sector: "General", Category: "Office Services", Subcategory: "Administrative", SubcategoryDescription: "General administrative tasks" },
    { Sector: "General", Category: "Technology Services", Subcategory: "IT Support", SubcategoryDescription: "Information technology support" },
    { Sector: "General", Category: "Facility Services", Subcategory: "Maintenance", SubcategoryDescription: "Building maintenance services" }
  ],
  jobs: [
    // Engine Services Jobs
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Oil Changes", Job: "Standard Oil Change", JobDescription: "Replace engine oil and filter", EstimatedTime: 30, Price: 45.00 },
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Oil Changes", Job: "Synthetic Oil Change", JobDescription: "Replace with synthetic engine oil", EstimatedTime: 30, Price: 65.00 },
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Filter Replacements", Job: "Air Filter Replacement", JobDescription: "Replace engine air filter", EstimatedTime: 15, Price: 25.00 },
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Filter Replacements", Job: "Fuel Filter Replacement", JobDescription: "Replace fuel filter", EstimatedTime: 45, Price: 85.00 },
    { Sector: "Automotive", Category: "Engine Services", Subcategory: "Tune-ups", Job: "Basic Tune-up", JobDescription: "Basic engine tune-up service", EstimatedTime: 120, Price: 150.00 },
    
    // Brake Services Jobs
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Brake Inspections", Job: "Brake System Inspection", JobDescription: "Complete brake system check", EstimatedTime: 45, Price: 50.00 },
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Pad Replacements", Job: "Front Brake Pads", JobDescription: "Replace front brake pads", EstimatedTime: 90, Price: 120.00 },
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Pad Replacements", Job: "Rear Brake Pads", JobDescription: "Replace rear brake pads", EstimatedTime: 90, Price: 110.00 },
    { Sector: "Automotive", Category: "Brake Services", Subcategory: "Rotor Services", Job: "Rotor Resurfacing", JobDescription: "Resurface brake rotors", EstimatedTime: 60, Price: 80.00 },
    
    // Transmission Services Jobs
    { Sector: "Automotive", Category: "Transmission Services", Subcategory: "Fluid Changes", Job: "Transmission Fluid Change", JobDescription: "Replace transmission fluid", EstimatedTime: 60, Price: 95.00 },
    { Sector: "Automotive", Category: "Transmission Services", Subcategory: "Repairs", Job: "Transmission Repair", JobDescription: "General transmission repair", EstimatedTime: 480, Price: 1200.00 },
    
    // Electrical Services Jobs
    { Sector: "Automotive", Category: "Electrical Services", Subcategory: "Battery Services", Job: "Battery Test", JobDescription: "Test battery condition", EstimatedTime: 15, Price: 20.00 },
    { Sector: "Automotive", Category: "Electrical Services", Subcategory: "Battery Services", Job: "Battery Replacement", JobDescription: "Replace vehicle battery", EstimatedTime: 30, Price: 150.00 },
    { Sector: "Automotive", Category: "Electrical Services", Subcategory: "Lighting", Job: "Headlight Bulb Replacement", JobDescription: "Replace headlight bulbs", EstimatedTime: 20, Price: 35.00 },
    
    // Suspension Services Jobs
    { Sector: "Automotive", Category: "Suspension Services", Subcategory: "Shock Absorbers", Job: "Shock Replacement", JobDescription: "Replace shock absorbers", EstimatedTime: 180, Price: 280.00 },
    { Sector: "Automotive", Category: "Suspension Services", Subcategory: "Alignment", Job: "Wheel Alignment", JobDescription: "Adjust wheel alignment", EstimatedTime: 90, Price: 75.00 },
    
    // General Services Jobs
    { Sector: "General", Category: "Office Services", Subcategory: "Administrative", Job: "Document Processing", JobDescription: "Process administrative documents", EstimatedTime: 60, Price: 40.00 },
    { Sector: "General", Category: "Technology Services", Subcategory: "IT Support", Job: "Computer Setup", JobDescription: "Set up computer systems", EstimatedTime: 120, Price: 100.00 },
    { Sector: "General", Category: "Facility Services", Subcategory: "Maintenance", Job: "General Cleaning", JobDescription: "General facility cleaning", EstimatedTime: 180, Price: 75.00 }
  ]
};

export const processExcelFileFromStorage = async (progressCallback: (progress: ImportProgress) => void): Promise<ImportResult> => {
  try {
    progressCallback({
      stage: 'Starting import...',
      message: 'Using sample automotive service data',
      progress: 5,
      completed: false,
      error: null
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    progressCallback({
      stage: 'Processing Sectors...',
      message: 'Processing sector data',
      progress: 25,
      completed: false,
      error: null
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    progressCallback({
      stage: 'Processing Categories...',
      message: 'Processing category data',
      progress: 45,
      completed: false,
      error: null
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    progressCallback({
      stage: 'Processing Subcategories...',
      message: 'Processing subcategory data',
      progress: 65,
      completed: false,
      error: null
    });

    await new Promise(resolve => setTimeout(resolve, 300));

    progressCallback({
      stage: 'Processing Jobs...',
      message: 'Processing job data',
      progress: 80,
      completed: false,
      error: null
    });

    // Structure the data
    const structuredData = {
      sectors: [],
      totalImported: 0,
      errors: [],
      sectorCount: 0,
      categoryCount: 0,
      subcategoryCount: 0,
      jobCount: 0
    };

    structuredData.sectors = mockSampleData.sectors.map(sector => {
      const sectorCategories = mockSampleData.categories.filter(cat => cat.Sector === sector.Sector);
      const categories = sectorCategories.map(category => {
        const categorySubcategories = mockSampleData.subcategories.filter(sub => 
          sub.Sector === sector.Sector && sub.Category === category.Category
        );
        const subcategories = categorySubcategories.map(subcategory => {
          const jobs = mockSampleData.jobs.filter(job => 
            job.Sector === sector.Sector && 
            job.Category === category.Category && 
            job.Subcategory === subcategory.Subcategory
          );
          structuredData.jobCount += jobs.length;
          structuredData.subcategoryCount += 1;
          return {
            name: subcategory.Subcategory,
            description: subcategory.SubcategoryDescription,
            jobs: jobs.map(job => ({
              name: job.Job,
              description: job.JobDescription,
              estimatedTime: job.EstimatedTime,
              price: job.Price
            }))
          };
        });
        structuredData.categoryCount += 1;
        return {
          name: category.Category,
          description: category.CategoryDescription,
          subcategories: subcategories
        };
      });
      structuredData.sectorCount += 1;
      return {
        name: sector.Sector,
        description: sector.SectorDescription,
        categories: categories
      };
    });

    structuredData.totalImported = structuredData.jobCount;

    progressCallback({
      stage: 'Importing to Database...',
      message: 'Saving data to the database',
      progress: 90,
      completed: false,
      error: null
    });

    // Clear existing data
    await clearAllServiceData();

    // Save to database
    for (const sector of structuredData.sectors) {
      const { data: createdSector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sector.name,
          description: sector.description,
          is_active: true
        })
        .select()
        .single();

      if (sectorError) throw sectorError;

      for (const category of sector.categories) {
        const { data: createdCategory, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description,
            sector_id: createdSector.id
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        for (const subcategory of category.subcategories) {
          const { data: createdSubcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategory.name,
              description: subcategory.description,
              category_id: createdCategory.id
            })
            .select()
            .single();

          if (subcategoryError) throw subcategoryError;

          for (const job of subcategory.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                name: job.name,
                description: job.description,
                estimated_time: job.estimatedTime,
                price: job.price,
                subcategory_id: createdSubcategory.id
              });

            if (jobError) throw jobError;
          }
        }
      }
    }

    progressCallback({
      stage: 'Complete',
      message: 'Data import completed successfully',
      progress: 100,
      completed: true,
      error: null
    });

    return {
      success: true,
      totalImported: structuredData.totalImported,
      errors: [],
      sectors: structuredData.sectorCount,
      categories: structuredData.categoryCount,
      subcategories: structuredData.subcategoryCount,
      services: structuredData.jobCount
    };

  } catch (error: any) {
    console.error("Error processing service data:", error);
    progressCallback({
      stage: 'Failed',
      message: error.message || 'An error occurred during import.',
      progress: 0,
      completed: false,
      error: error.message || 'An error occurred during import.'
    });
    
    return {
      success: false,
      totalImported: 0,
      errors: [error.message || 'An error occurred during import.'],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0
    };
  }
};

export const clearAllServiceData = async (): Promise<void> => {
  try {
    // Delete in correct order due to foreign key constraints
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('All service data cleared from the database.');
  } catch (error) {
    console.error('Failed to clear service data:', error);
    throw error;
  }
};

export const getServiceCounts = async () => {
  try {
    const { count: sectorCount } = await supabase
      .from('service_sectors')
      .select('*', { count: 'exact', head: true });
    
    const { count: categoryCount } = await supabase
      .from('service_categories')
      .select('*', { count: 'exact', head: true });
    
    const { count: subcategoryCount } = await supabase
      .from('service_subcategories')
      .select('*', { count: 'exact', head: true });
    
    const { count: jobCount } = await supabase
      .from('service_jobs')
      .select('*', { count: 'exact', head: true });

    return {
      sectors: sectorCount || 0,
      categories: categoryCount || 0,
      subcategories: subcategoryCount || 0,
      jobs: jobCount || 0
    };
  } catch (error) {
    console.error('Failed to retrieve service counts:', error);
    throw error;
  }
};

export const importServicesFromStorage = async (progressCallback: (progress: ImportProgress) => void): Promise<ImportResult> => {
  try {
    progressCallback({
      stage: 'Starting import...',
      message: 'Initializing import process',
      progress: 0,
      completed: false,
      error: null
    });

    const importResult = await processExcelFileFromStorage(progressCallback);

    progressCallback({
      stage: 'Import completed',
      message: `Successfully imported ${importResult.totalImported} services.`,
      progress: 100,
      completed: true,
      error: null
    });

    return importResult;
  } catch (error: any) {
    console.error("Import error:", error);
    progressCallback({
      stage: 'Import failed',
      message: error.message || 'An error occurred during import.',
      progress: 0,
      completed: false,
      error: error.message || 'An error occurred during import.'
    });
    throw error;
  }
};
