import * as XLSX from 'xlsx';
import { storage } from '@/lib/utils/firebase';
import { ref, listAll, getBytes } from "firebase/storage";
import { db } from '@/lib/utils/db';
import { 
  ServiceSectorSchema, 
  ServiceCategorySchema, 
  ServiceSubcategorySchema, 
  ServiceJobSchema 
} from '@/lib/validations/service';
import { z } from 'zod';

// Define the structure of data we expect in each sheet
const SectorSchema = z.object({
  Sector: z.string(),
  SectorDescription: z.string().optional(),
});

const CategorySchema = z.object({
  Sector: z.string(),
  Category: z.string(),
  CategoryDescription: z.string().optional(),
});

const SubcategorySchema = z.object({
  Sector: z.string(),
  Category: z.string(),
  Subcategory: z.string(),
  SubcategoryDescription: z.string().optional(),
});

const JobSchema = z.object({
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

export interface ProcessedServiceData {
  sectors: {
    name: string;
    description?: string;
    categories: {
      name: string;
      description?: string;
      subcategories: {
        name: string;
        description?: string;
        jobs: {
          name: string;
          description?: string;
          estimatedTime?: number;
          price?: number;
        }[];
      }[];
    }[];
  }[];
  totalImported?: number;
  errors?: string[];
  sectorCount?: number;
  categoryCount?: number;
  subcategoryCount?: number;
  jobCount?: number;
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

const validateAndParseSheet = <T>(
  workbook: XLSX.WorkBook,
  sheetName: string,
  schema: z.ZodSchema<T>
): { data: T[]; errors: z.ZodError[] } => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    return { data: [], errors: [new z.ZodError([{ code: 'custom', message: `Sheet "${sheetName}" not found`, path: [] }])] };
  }

  const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (rawData.length === 0) {
    return { data: [], errors: [new z.ZodError([{ code: 'custom', message: `Sheet "${sheetName}" is empty`, path: [] }])] };
  }

  // Extract headers from the first row
  const headers = rawData[0] as string[];

  // Process data rows, skipping the header row
  const dataRows = rawData.slice(1).map(row => {
    const rowData: any = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  });

  const parsedData: T[] = [];
  const errors: z.ZodError[] = [];

  dataRows.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      parsedData.push(result.data);
    } else {
      errors.push(result.error);
    }
  });

  return { data: parsedData, errors: errors };
};

export const processExcelFileFromStorage = async (
  progressCallback: (progress: ImportProgress) => void
): Promise<ImportResult> => {
  try {
    progressCallback({
      stage: 'Fetching files...',
      message: 'Looking for Excel files in storage',
      progress: 5,
      completed: false,
      error: null,
    });

    const storageRef = ref(storage, 'service-data');
    const fileList = await listAll(storageRef);
    const excelFiles = fileList.items.filter(item => item.name.endsWith('.xlsx'));

    if (excelFiles.length === 0) {
      throw new Error('No Excel files found in the storage folder.');
    }

    let allSectors: z.infer<typeof SectorSchema>[] = [];
    let allCategories: z.infer<typeof CategorySchema>[] = [];
    let allSubcategories: z.infer<typeof SubcategorySchema>[] = [];
    let allJobs: z.infer<typeof JobSchema>[] = [];
    let errors: string[] = [];

    for (let i = 0; i < excelFiles.length; i++) {
      const file = excelFiles[i];
      progressCallback({
        stage: 'Downloading file...',
        message: `Downloading ${file.name} (${i + 1} of ${excelFiles.length})`,
        progress: 10 + (i / excelFiles.length) * 15,
        completed: false,
        error: null,
      });

      const fileRef = ref(storage, `service-data/${file.name}`);
      const fileData = await getBytes(fileRef);
      const workbook = XLSX.read(fileData, { type: 'array' });

      // Validate and parse Sector sheet
      progressCallback({
        stage: 'Processing Sectors...',
        message: `Validating and parsing Sector sheet from ${file.name}`,
        progress: 25 + (i / excelFiles.length) * 15,
        completed: false,
        error: null,
      });
      const sectorsResult = validateAndParseSheet(workbook, 'Sectors', SectorSchema);
      if (sectorsResult.errors.length > 0) {
        errors.push(`Sector Sheet Errors: ${sectorsResult.errors.map(e => e.message).join(', ')}`);
      } else {
        allSectors = allSectors.concat(sectorsResult.data);
      }

      // Validate and parse Category sheet
      progressCallback({
        stage: 'Processing Categories...',
        message: `Validating and parsing Category sheet from ${file.name}`,
        progress: 40 + (i / excelFiles.length) * 15,
        completed: false,
        error: null,
      });
      const categoriesResult = validateAndParseSheet(workbook, 'Categories', CategorySchema);
      if (categoriesResult.errors.length > 0) {
        errors.push(`Category Sheet Errors: ${categoriesResult.errors.map(e => e.message).join(', ')}`);
      } else {
        allCategories = allCategories.concat(categoriesResult.data);
      }

      // Validate and parse Subcategory sheet
      progressCallback({
        stage: 'Processing Subcategories...',
        message: `Validating and parsing Subcategory sheet from ${file.name}`,
        progress: 55 + (i / excelFiles.length) * 15,
        completed: false,
        error: null,
      });
      const subcategoriesResult = validateAndParseSheet(workbook, 'Subcategories', SubcategorySchema);
      if (subcategoriesResult.errors.length > 0) {
        errors.push(`Subcategory Sheet Errors: ${subcategoriesResult.errors.map(e => e.message).join(', ')}`);
      } else {
        allSubcategories = allSubcategories.concat(subcategoriesResult.data);
      }

      // Validate and parse Job sheet
      progressCallback({
        stage: 'Processing Jobs...',
        message: `Validating and parsing Job sheet from ${file.name}`,
        progress: 70 + (i / excelFiles.length) * 15,
        completed: false,
        error: null,
      });
      const jobsResult = validateAndParseSheet(workbook, 'Jobs', JobSchema);
      if (jobsResult.errors.length > 0) {
        errors.push(`Job Sheet Errors: ${jobsResult.errors.map(e => e.message).join(', ')}`);
      } else {
        allJobs = allJobs.concat(jobsResult.data);
      }
    }

    progressCallback({
      stage: 'Structuring Data...',
      message: 'Combining and structuring data',
      progress: 85,
      completed: false,
      error: null,
    });

    // Structure the data
    const structuredData: ProcessedServiceData = {
      sectors: [],
      totalImported: 0,
      errors: [],
      sectorCount: 0,
      categoryCount: 0,
      subcategoryCount: 0,
      jobCount: 0
    };

    structuredData.sectors = allSectors.map(sector => {
      const sectorCategories = allCategories.filter(cat => cat.Sector === sector.Sector);
      const categories = sectorCategories.map(category => {
        const categorySubcategories = allSubcategories.filter(sub => sub.Sector === sector.Sector && sub.Category === category.Category);
        const subcategories = categorySubcategories.map(subcategory => {
          const jobs = allJobs.filter(job => job.Sector === sector.Sector && job.Category === category.Category && job.Subcategory === subcategory.Subcategory);
          structuredData.jobCount! += jobs.length;
          return {
            name: subcategory.Subcategory,
            description: subcategory.SubcategoryDescription,
            jobs: jobs.map(job => ({
              name: job.Job,
              description: job.JobDescription,
              estimatedTime: job.EstimatedTime,
              price: job.Price,
            })),
          };
        });
        structuredData.categoryCount! += 1;
        return {
          name: category.Category,
          description: category.CategoryDescription,
          subcategories: subcategories,
        };
      });
      structuredData.sectorCount! += 1;
      return {
        name: sector.Sector,
        description: sector.SectorDescription,
        categories: categories,
      };
    });

    structuredData.totalImported = allJobs.length;
    structuredData.errors = errors;

    progressCallback({
      stage: 'Importing to Database...',
      message: 'Saving data to the database',
      progress: 90,
      completed: false,
      error: null,
    });

    // Clear existing data
    await clearAllServiceData();

    // Save to database
    for (const sector of structuredData.sectors) {
      const sectorData = ServiceSectorSchema.parse({ name: sector.name, description: sector.description });
      const createdSector = await db.serviceSector.create({ data: sectorData });

      for (const category of sector.categories) {
        const categoryData = ServiceCategorySchema.parse({ name: category.name, description: category.description, sectorId: createdSector.id });
        const createdCategory = await db.serviceCategory.create({ data: categoryData });

        for (const subcategory of category.subcategories) {
          const subcategoryData = ServiceSubcategorySchema.parse({ name: subcategory.name, description: subcategory.description, categoryId: createdCategory.id });
          const createdSubcategory = await db.serviceSubcategory.create({ data: subcategoryData });

          for (const job of subcategory.jobs) {
            const jobData = ServiceJobSchema.parse({ name: job.name, description: job.description, estimatedTime: job.estimatedTime, price: job.price, subcategoryId: createdSubcategory.id });
            await db.serviceJob.create({ data: jobData });
          }
        }
      }
    }

    progressCallback({
      stage: 'Complete',
      message: 'Data import completed',
      progress: 100,
      completed: true,
      error: null,
    });

    return {
      success: true,
      totalImported: structuredData.totalImported || 0,
      errors: structuredData.errors || [],
      sectors: structuredData.sectorCount || 0,
      categories: structuredData.categoryCount || 0,
      subcategories: structuredData.subcategoryCount || 0,
      services: structuredData.jobCount || 0
    };

  } catch (error: any) {
    console.error("Error processing Excel files:", error);
    progressCallback({
      stage: 'Failed',
      message: error.message || 'An error occurred during import.',
      progress: 0,
      completed: false,
      error: error.message || 'An error occurred during import.',
    });
    return {
      success: false,
      totalImported: 0,
      errors: [error.message || 'An error occurred during import.'],
      sectors: 0,
      categories: 0,
      subcategories: 0,
      services: 0,
    };
  }
};

export const clearAllServiceData = async () => {
  try {
    // Delete all service jobs
    await db.serviceJob.deleteMany({});

    // Delete all service subcategories
    await db.serviceSubcategory.deleteMany({});

    // Delete all service categories
    await db.serviceCategory.deleteMany({});

    // Delete all service sectors
    await db.serviceSector.deleteMany({});

    console.log('All service data cleared from the database.');
  } catch (error) {
    console.error('Failed to clear service data:', error);
    throw error;
  }
};

export const getServiceCounts = async () => {
  try {
    const sectorCount = await db.serviceSector.count();
    const categoryCount = await db.serviceCategory.count();
    const subcategoryCount = await db.serviceSubcategory.count();
    const jobCount = await db.serviceJob.count();

    return {
      sectors: sectorCount,
      categories: categoryCount,
      subcategories: subcategoryCount,
      jobs: jobCount,
    };
  } catch (error) {
    console.error('Failed to retrieve service counts:', error);
    throw error;
  }
};

export const importServicesFromStorage = async (progressCallback: (progress: ImportProgress) => void) => {
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
