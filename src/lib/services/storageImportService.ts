
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { parseExcelToServiceCategories } from './excelParser';

export interface ImportProgress {
  stage: 'downloading' | 'parsing' | 'processing' | 'uploading' | 'complete';
  progress: number;
  message: string;
  categoriesProcessed?: number;
  totalCategories?: number;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  categories: ServiceMainCategory[];
  totalJobs: number;
  totalSubcategories: number;
  totalCategories: number;
  processingTime: number;
  errors?: string[];
}

export class StorageImportService {
  private onProgress?: (progress: ImportProgress) => void;

  constructor(onProgress?: (progress: ImportProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(update: Partial<ImportProgress>) {
    if (this.onProgress) {
      this.onProgress(update as ImportProgress);
    }
  }

  async importFromStorage(bucketName: string, fileName: string): Promise<ImportResult> {
    const startTime = Date.now();
    let categories: ServiceMainCategory[] = [];

    try {
      // Step 1: Download file from storage
      this.updateProgress({
        stage: 'downloading',
        progress: 0,
        message: `Downloading ${fileName} from storage...`
      });

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(fileName);

      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }

      if (!fileData) {
        throw new Error('No data received from storage');
      }

      this.updateProgress({
        stage: 'downloading',
        progress: 100,
        message: 'File downloaded successfully'
      });

      // Step 2: Parse Excel file
      this.updateProgress({
        stage: 'parsing',
        progress: 0,
        message: 'Parsing Excel file...'
      });

      // Convert blob to File for parsing
      const file = new File([fileData], fileName, {
        type: fileData.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      categories = await parseExcelToServiceCategories(file);

      this.updateProgress({
        stage: 'parsing',
        progress: 100,
        message: `Parsed ${categories.length} categories successfully`
      });

      // Step 3: Process and validate data
      this.updateProgress({
        stage: 'processing',
        progress: 0,
        message: 'Processing service data...',
        totalCategories: categories.length
      });

      const processedCategories = await this.processLargeDataset(categories);

      // Step 4: Upload to database
      this.updateProgress({
        stage: 'uploading',
        progress: 0,
        message: 'Uploading to database...'
      });

      await this.uploadToDatabase(processedCategories);

      this.updateProgress({
        stage: 'uploading',
        progress: 100,
        message: 'Upload completed successfully'
      });

      // Calculate totals
      const totalSubcategories = processedCategories.reduce(
        (sum, cat) => sum + cat.subcategories.length, 0
      );
      const totalJobs = processedCategories.reduce(
        (sum, cat) => sum + cat.subcategories.reduce(
          (subSum, sub) => subSum + sub.jobs.length, 0
        ), 0
      );

      const processingTime = Date.now() - startTime;

      this.updateProgress({
        stage: 'complete',
        progress: 100,
        message: `Import completed! ${totalJobs} jobs imported in ${Math.round(processingTime / 1000)}s`
      });

      return {
        success: true,
        categories: processedCategories,
        totalCategories: processedCategories.length,
        totalSubcategories,
        totalJobs,
        processingTime
      };

    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      this.updateProgress({
        stage: 'complete',
        progress: 0,
        message: 'Import failed',
        error: errorMessage
      });

      return {
        success: false,
        categories: [],
        totalCategories: 0,
        totalSubcategories: 0,
        totalJobs: 0,
        processingTime: Date.now() - startTime,
        errors: [errorMessage]
      };
    }
  }

  private async processLargeDataset(categories: ServiceMainCategory[]): Promise<ServiceMainCategory[]> {
    const chunkSize = 10; // Process 10 categories at a time
    const processedCategories: ServiceMainCategory[] = [];

    for (let i = 0; i < categories.length; i += chunkSize) {
      const chunk = categories.slice(i, i + chunkSize);
      
      // Process chunk with some validation and cleanup
      const processedChunk = chunk.map(category => ({
        ...category,
        name: category.name.trim(),
        description: category.description?.trim() || '',
        subcategories: category.subcategories.map(sub => ({
          ...sub,
          name: sub.name.trim(),
          description: sub.description?.trim() || '',
          jobs: sub.jobs.filter(job => job.name && job.name.trim()).map(job => ({
            ...job,
            name: job.name.trim(),
            description: job.description?.trim() || '',
            estimatedTime: job.estimatedTime || 60,
            price: job.price || 0
          }))
        })).filter(sub => sub.jobs.length > 0)
      })).filter(cat => cat.subcategories.length > 0);

      processedCategories.push(...processedChunk);

      // Update progress
      const progress = Math.round(((i + chunkSize) / categories.length) * 100);
      this.updateProgress({
        stage: 'processing',
        progress: Math.min(progress, 100),
        message: `Processing categories... ${Math.min(i + chunkSize, categories.length)}/${categories.length}`,
        categoriesProcessed: Math.min(i + chunkSize, categories.length),
        totalCategories: categories.length
      });

      // Small delay to prevent blocking the UI
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return processedCategories;
  }

  private async uploadToDatabase(categories: ServiceMainCategory[]): Promise<void> {
    const batchSize = 50; // Upload in smaller batches for better performance
    let uploadedCount = 0;

    for (const category of categories) {
      try {
        // Insert category
        const { data: categoryData, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description,
            position: category.position
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Insert subcategories in batches
        for (let i = 0; i < category.subcategories.length; i += batchSize) {
          const subcategoryBatch = category.subcategories.slice(i, i + batchSize);
          
          for (const subcategory of subcategoryBatch) {
            const { data: subcategoryData, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                category_id: categoryData.id,
                name: subcategory.name,
                description: subcategory.description
              })
              .select()
              .single();

            if (subcategoryError) throw subcategoryError;

            // Insert jobs for this subcategory
            if (subcategory.jobs.length > 0) {
              const jobsToInsert = subcategory.jobs.map(job => ({
                subcategory_id: subcategoryData.id,
                name: job.name,
                description: job.description,
                estimated_time: job.estimatedTime,
                price: job.price
              }));

              const { error: jobsError } = await supabase
                .from('service_jobs')
                .insert(jobsToInsert);

              if (jobsError) throw jobsError;
            }
          }
        }

        uploadedCount++;
        const progress = Math.round((uploadedCount / categories.length) * 100);
        this.updateProgress({
          stage: 'uploading',
          progress,
          message: `Uploaded ${uploadedCount}/${categories.length} categories`,
          categoriesProcessed: uploadedCount,
          totalCategories: categories.length
        });

      } catch (error) {
        console.error(`Error uploading category ${category.name}:`, error);
        throw error;
      }
    }
  }
}

export async function importServicesFromStorage(
  bucketName: string, 
  fileName: string, 
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const service = new StorageImportService(onProgress);
  return service.importFromStorage(bucketName, fileName);
}
