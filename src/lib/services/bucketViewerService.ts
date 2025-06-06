
import { supabase } from '@/integrations/supabase/client';
import type { StorageFile, SectorFiles } from './types';

class BucketViewerService {
  private bucketName = 'service-imports';

  async ensureBucketExists(): Promise<void> {
    try {
      console.log(`Checking if bucket ${this.bucketName} exists...`);
      
      // First, try to list buckets to see if it exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        throw new Error(`Failed to check existing buckets: ${listError.message}`);
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);
      
      if (bucketExists) {
        console.log(`Bucket ${this.bucketName} already exists`);
        return;
      }

      console.log(`Creating bucket: ${this.bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
        public: true,
        allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
        fileSizeLimit: 52428800 // 50MB
      });

      if (createError) {
        // If bucket already exists, that's fine
        if (createError.message?.includes('already exists') || createError.message?.includes('unique_violation')) {
          console.log(`Bucket ${this.bucketName} already exists (creation attempted)`);
          return;
        }
        console.error('Error creating bucket:', createError);
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }

      console.log(`Successfully created bucket: ${this.bucketName}`);
    } catch (error) {
      console.error('Error in ensureBucketExists:', error);
      throw error;
    }
  }

  async getBucketInfo() {
    try {
      console.log('Fetching bucket info...');
      console.log(`Fetching bucket info for: ${this.bucketName}`);
      
      // Try to list files directly without ensuring bucket exists first
      const { data: filesList, error: filesError } = await supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

      if (filesError) {
        // If bucket doesn't exist, try to create it
        if (filesError.message?.includes('not found') || filesError.message?.includes('does not exist')) {
          console.log(`Bucket ${this.bucketName} not found, attempting to create...`);
          await this.ensureBucketExists();
          
          // Retry listing files after creating bucket
          const { data: retryFilesList, error: retryError } = await supabase.storage
            .from(this.bucketName)
            .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
            
          if (retryError) {
            throw new Error(`Failed to access bucket after creation: ${retryError.message}`);
          }
          
          return this.processFilesList(retryFilesList || []);
        }
        
        throw new Error(`Failed to access bucket: ${filesError.message}`);
      }

      return this.processFilesList(filesList || []);
    } catch (error) {
      console.error('Error getting bucket info:', error);
      throw error;
    }
  }

  private processFilesList(filesList: any[]) {
    const files: StorageFile[] = [];
    const folders: { name: string; path: string; lastModified?: Date }[] = [];

    filesList.forEach(item => {
      if (item.metadata) {
        files.push({
          name: item.name,
          path: item.name,
          size: item.metadata.size,
          type: item.metadata.mimetype,
          lastModified: new Date(item.updated_at)
        });
      } else {
        folders.push({
          name: item.name,
          path: item.name,
          lastModified: new Date(item.updated_at)
        });
      }
    });

    return { exists: true, files, folders };
  }

  async getFolderFiles(folderPath: string): Promise<StorageFile[]> {
    try {
      console.log(`Getting files in folder: ${folderPath}`);
      
      const { data: filesList, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

      if (error) {
        console.error(`Error getting files in folder ${folderPath}:`, error);
        return [];
      }

      console.log(`Found ${filesList?.length || 0} items in folder ${folderPath}:`, filesList);

      const excelFiles = filesList?.filter(item => {
        if (!item.metadata) {
          console.log(`Skipping non-file item: ${item.name}`);
          return false;
        }
        
        const fileName = item.name.toLowerCase();
        const hasExcelExtension = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        
        console.log(`File: ${item.name}, has Excel extension: ${hasExcelExtension}`);
        return hasExcelExtension;
      }).map(item => ({
        name: item.name,
        path: `${folderPath}/${item.name}`,
        size: item.metadata?.size,
        type: item.metadata?.mimetype,
        lastModified: new Date(item.updated_at)
      })) || [];

      console.log(`Filtered ${excelFiles.length} Excel files from folder ${folderPath}`);
      return excelFiles;
    } catch (error) {
      console.error(`Error getting files in folder ${folderPath}:`, error);
      return [];
    }
  }

  async getAllSectorFiles(): Promise<SectorFiles[]> {
    try {
      console.log('Getting all sector files...');
      const bucketInfo = await this.getBucketInfo();
      if (!bucketInfo.exists) {
        console.log('Bucket does not exist');
        return [];
      }

      console.log(`Found ${bucketInfo.folders.length} folders:`, bucketInfo.folders.map(f => f.name));

      const sectorFiles: SectorFiles[] = [];

      for (const folder of bucketInfo.folders) {
        console.log(`Processing folder: ${folder.name}`);
        const excelFiles = await this.getFolderFiles(folder.name);
        
        console.log(`Found ${excelFiles.length} Excel files in ${folder.name}`);
        
        // Include all folders in the result, even if they have no Excel files
        sectorFiles.push({
          sectorName: folder.name,
          excelFiles,
          totalFiles: excelFiles.length
        });
      }

      console.log('Final sector files result:', sectorFiles);
      return sectorFiles;
    } catch (error) {
      console.error('Error getting all sector files:', error);
      return [];
    }
  }

  async refreshBucketData() {
    return this.getBucketInfo();
  }
}

export const bucketViewerService = new BucketViewerService();
