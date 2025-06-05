
import { supabase } from '@/integrations/supabase/client';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

interface ServiceData {
  sectorName: string;
  categoryName: string;
  subcategoryName: string;
  jobName: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
}

interface BatchImportResult {
  success: boolean;
  totalProcessed: number;
  errors: string[];
}

export class BatchServiceImporter {
  private onProgress?: (progress: ImportProgress) => void;
  private cancelled = false;

  constructor(onProgress?: (progress: ImportProgress) => void) {
    this.onProgress = onProgress;
  }

  cancel() {
    this.cancelled = true;
  }

  async importServices(services: ServiceData[]): Promise<BatchImportResult> {
    this.cancelled = false;
    const errors: string[] = [];
    let totalProcessed = 0;

    try {
      // Step 1: Process sectors (10% of progress)
      this.updateProgress('sectors', 5, 'Processing service sectors...');
      const sectorMap = await this.processSectors(services);
      if (this.cancelled) throw new Error('Import cancelled');

      // Step 2: Process categories (20% of progress)
      this.updateProgress('categories', 15, 'Processing service categories...');
      const categoryMap = await this.processCategories(services, sectorMap);
      if (this.cancelled) throw new Error('Import cancelled');

      // Step 3: Process subcategories (30% of progress)
      this.updateProgress('subcategories', 25, 'Processing service subcategories...');
      const subcategoryMap = await this.processSubcategories(services, categoryMap);
      if (this.cancelled) throw new Error('Import cancelled');

      // Step 4: Process jobs in batches (40% to 100% of progress)
      this.updateProgress('jobs', 35, 'Processing service jobs...');
      totalProcessed = await this.processJobsInBatches(services, subcategoryMap);

      this.updateProgress('complete', 100, `Successfully imported ${totalProcessed} services`);
      
      return {
        success: true,
        totalProcessed,
        errors
      };

    } catch (error) {
      console.error('Batch import error:', error);
      return {
        success: false,
        totalProcessed,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  private updateProgress(stage: string, progress: number, message: string) {
    if (this.onProgress) {
      this.onProgress({ stage, progress, message });
    }
  }

  private async processSectors(services: ServiceData[]): Promise<Map<string, string>> {
    const uniqueSectors = [...new Set(services.map(s => s.sectorName))];
    const sectorMap = new Map<string, string>();

    // Get existing sectors
    const { data: existingSectors } = await supabase
      .from('service_sectors')
      .select('id, name');

    existingSectors?.forEach(sector => {
      sectorMap.set(sector.name, sector.id);
    });

    // Batch insert new sectors
    const newSectors = uniqueSectors.filter(name => !sectorMap.has(name));
    if (newSectors.length > 0) {
      const sectorsToInsert = newSectors.map((name, index) => ({
        name,
        description: `${name} services`,
        position: (existingSectors?.length || 0) + index + 1,
        is_active: true
      }));

      const { data: insertedSectors, error } = await supabase
        .from('service_sectors')
        .insert(sectorsToInsert)
        .select('id, name');

      if (error) throw error;

      insertedSectors?.forEach(sector => {
        sectorMap.set(sector.name, sector.id);
      });
    }

    return sectorMap;
  }

  private async processCategories(services: ServiceData[], sectorMap: Map<string, string>): Promise<Map<string, string>> {
    const uniqueCategories = [...new Set(services.map(s => `${s.sectorName}:${s.categoryName}`))];
    const categoryMap = new Map<string, string>();

    // Get existing categories
    const { data: existingCategories } = await supabase
      .from('service_categories')
      .select('id, name, sector_id');

    existingCategories?.forEach(category => {
      const sector = Object.entries(Object.fromEntries(sectorMap)).find(([_, id]) => id === category.sector_id);
      if (sector) {
        categoryMap.set(`${sector[0]}:${category.name}`, category.id);
      }
    });

    // Batch insert new categories
    const newCategories = uniqueCategories.filter(key => !categoryMap.has(key));
    if (newCategories.length > 0) {
      const categoriesToInsert = newCategories.map((key, index) => {
        const [sectorName, categoryName] = key.split(':');
        const sectorId = sectorMap.get(sectorName);
        if (!sectorId) throw new Error(`Sector not found: ${sectorName}`);

        return {
          name: categoryName,
          description: `${categoryName} services`,
          sector_id: sectorId,
          position: index + 1
        };
      });

      const { data: insertedCategories, error } = await supabase
        .from('service_categories')
        .insert(categoriesToInsert)
        .select('id, name, sector_id');

      if (error) throw error;

      insertedCategories?.forEach(category => {
        const sector = Object.entries(Object.fromEntries(sectorMap)).find(([_, id]) => id === category.sector_id);
        if (sector) {
          categoryMap.set(`${sector[0]}:${category.name}`, category.id);
        }
      });
    }

    return categoryMap;
  }

  private async processSubcategories(services: ServiceData[], categoryMap: Map<string, string>): Promise<Map<string, string>> {
    const uniqueSubcategories = [...new Set(services.map(s => `${s.sectorName}:${s.categoryName}:${s.subcategoryName}`))];
    const subcategoryMap = new Map<string, string>();

    // Get existing subcategories
    const { data: existingSubcategories } = await supabase
      .from('service_subcategories')
      .select('id, name, category_id');

    // Build reverse lookup for categories
    const categoryIdToKey = new Map<string, string>();
    for (const [key, id] of categoryMap.entries()) {
      categoryIdToKey.set(id, key);
    }

    existingSubcategories?.forEach(subcategory => {
      const categoryKey = categoryIdToKey.get(subcategory.category_id);
      if (categoryKey) {
        subcategoryMap.set(`${categoryKey}:${subcategory.name}`, subcategory.id);
      }
    });

    // Batch insert new subcategories
    const newSubcategories = uniqueSubcategories.filter(key => !subcategoryMap.has(key));
    if (newSubcategories.length > 0) {
      const subcategoriesToInsert = newSubcategories.map(key => {
        const parts = key.split(':');
        const subcategoryName = parts[2];
        const categoryKey = `${parts[0]}:${parts[1]}`;
        const categoryId = categoryMap.get(categoryKey);
        if (!categoryId) throw new Error(`Category not found: ${categoryKey}`);

        return {
          name: subcategoryName,
          description: `${subcategoryName} services`,
          category_id: categoryId
        };
      });

      const { data: insertedSubcategories, error } = await supabase
        .from('service_subcategories')
        .insert(subcategoriesToInsert)
        .select('id, name, category_id');

      if (error) throw error;

      insertedSubcategories?.forEach(subcategory => {
        const categoryKey = categoryIdToKey.get(subcategory.category_id);
        if (categoryKey) {
          subcategoryMap.set(`${categoryKey}:${subcategory.name}`, subcategory.id);
        }
      });
    }

    return subcategoryMap;
  }

  private async processJobsInBatches(services: ServiceData[], subcategoryMap: Map<string, string>): Promise<number> {
    const BATCH_SIZE = 100;
    let totalProcessed = 0;
    const batches = this.chunkArray(services, BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      if (this.cancelled) throw new Error('Import cancelled');

      const batch = batches[i];
      const progress = 35 + ((i + 1) / batches.length) * 65;
      
      this.updateProgress('jobs', progress, `Processing batch ${i + 1} of ${batches.length} (${batch.length} services)...`);

      const jobsToInsert = batch.map((service, index) => {
        const subcategoryKey = `${service.sectorName}:${service.categoryName}:${service.subcategoryName}`;
        const subcategoryId = subcategoryMap.get(subcategoryKey);
        if (!subcategoryId) throw new Error(`Subcategory not found: ${subcategoryKey}`);

        return {
          name: service.jobName,
          description: service.description || '',
          estimated_time: service.estimatedTime || null,
          price: service.price || null,
          subcategory_id: subcategoryId,
          position: index + 1
        };
      });

      // Use upsert to handle duplicates
      const { error } = await supabase
        .from('service_jobs')
        .upsert(jobsToInsert, {
          onConflict: 'name,subcategory_id',
          ignoreDuplicates: true
        });

      if (error) {
        console.error(`Batch ${i + 1} error:`, error);
        // Continue with next batch instead of failing completely
      } else {
        totalProcessed += batch.length;
      }

      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return totalProcessed;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
