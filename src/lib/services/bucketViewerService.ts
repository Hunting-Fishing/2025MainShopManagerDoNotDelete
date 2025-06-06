
import { supabase } from '@/integrations/supabase/client';
import type { StorageFile, SectorFiles } from './types';

export class BucketViewerService {
  private bucketName = 'service-imports';

  async ensureBucketExists(): Promise<boolean> {
    try {
      console.log(`Checking if bucket ${this.bucketName} exists...`);
      
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName) || false;
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${this.bucketName}`);
        // Create the bucket
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          return false;
        }
        
        console.log(`Successfully created bucket: ${this.bucketName}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      return false;
    }
  }

  async getBucketInfo(): Promise<{
    exists: boolean;
    files: StorageFile[];
    folders: { name: string; path: string; lastModified?: Date }[];
    error?: string;
  }> {
    try {
      console.log(`Fetching bucket info for: ${this.bucketName}`);
      
      // Ensure bucket exists first
      const bucketReady = await this.ensureBucketExists();
      if (!bucketReady) {
        return { 
          exists: false, 
          files: [], 
          folders: [], 
          error: `Failed to create or access bucket: ${this.bucketName}` 
        };
      }

      // List all files in the bucket with pagination
      const allItems: any[] = [];
      let offset = 0;
      const limit = 1000;
      
      while (true) {
        console.log(`Fetching batch: offset ${offset}, limit ${limit} for path: `);
        const { data: filesList, error: filesError } = await supabase.storage
          .from(this.bucketName)
          .list('', { 
            limit, 
            offset,
            sortBy: { column: 'name', order: 'asc' } 
          });

        if (filesError) {
          console.error('Error listing files:', filesError);
          return { 
            exists: true, 
            files: [], 
            folders: [], 
            error: `Error listing files: ${filesError.message}` 
          };
        }
        
        if (!filesList || filesList.length === 0) break;
        
        allItems.push(...filesList);
        console.log(`Fetched ${filesList.length} items, total so far: ${allItems.length}`);
        
        if (filesList.length < limit) break;
        offset += limit;
      }

      console.log(`Total items fetched: ${allItems.length}`);

      const files: StorageFile[] = [];
      const folders: { name: string; path: string; lastModified?: Date }[] = [];

      allItems.forEach(item => {
        if (item.metadata) {
          // It's a file
          files.push({
            name: item.name,
            path: item.name,
            size: item.metadata.size,
            type: item.metadata.mimetype,
            lastModified: new Date(item.updated_at)
          });
        } else {
          // It's a folder
          folders.push({
            name: item.name,
            path: item.name,
            lastModified: new Date(item.updated_at)
          });
        }
      });

      console.log(`Found ${files.length} files and ${folders.length} folders in bucket: ${this.bucketName}`);
      return { exists: true, files, folders };
    } catch (error) {
      console.error('Error getting bucket info:', error);
      return { 
        exists: false, 
        files: [], 
        folders: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getFilesInFolder(folderPath: string, extensions: string[] = ['.xlsx']): Promise<StorageFile[]> {
    try {
      console.log(`Fetching all files in folder: ${folderPath}`);
      
      // Ensure bucket exists first
      const bucketReady = await this.ensureBucketExists();
      if (!bucketReady) {
        console.error(`Bucket ${this.bucketName} not ready`);
        return [];
      }
      
      const allItems: any[] = [];
      let offset = 0;
      const limit = 1000;
      
      while (true) {
        console.log(`Fetching batch: offset ${offset}, limit ${limit} for path: ${folderPath}`);
        const { data: filesList, error } = await supabase.storage
          .from(this.bucketName)
          .list(folderPath, { 
            limit, 
            offset,
            sortBy: { column: 'name', order: 'asc' } 
          });

        if (error) throw error;
        
        if (!filesList || filesList.length === 0) break;
        
        allItems.push(...filesList);
        console.log(`Fetched ${filesList.length} items, total so far: ${allItems.length}`);
        
        if (filesList.length < limit) break;
        offset += limit;
      }

      console.log(`Total items fetched: ${allItems.length}`);

      const filteredFiles = allItems.filter(item => {
        if (!item.metadata) return false; // Skip folders
        const hasValidExtension = extensions.length === 0 || 
          extensions.some(ext => item.name.toLowerCase().endsWith(ext.toLowerCase()));
        return hasValidExtension;
      }).map(item => ({
        name: item.name,
        path: `${folderPath}/${item.name}`,
        size: item.metadata?.size,
        type: item.metadata?.mimetype,
        lastModified: new Date(item.updated_at)
      }));

      console.log(`Found ${filteredFiles.length} files in folder: ${folderPath}`);
      return filteredFiles;
    } catch (error) {
      console.error(`Error getting files in folder ${folderPath}:`, error);
      return [];
    }
  }

  async getAllSectorFiles(): Promise<SectorFiles[]> {
    try {
      console.log('Getting all sector files from bucket:', this.bucketName);
      const bucketInfo = await this.getBucketInfo();
      if (!bucketInfo.exists) {
        console.error('Bucket does not exist or cannot be accessed');
        return [];
      }

      console.log(`Found ${bucketInfo.folders.length} sector folders`);
      const sectorFiles: SectorFiles[] = [];

      for (const folder of bucketInfo.folders) {
        console.log(`Processing sector: ${folder.name}`);
        const excelFiles = await this.getFilesInFolder(folder.name);
        console.log(`Sector ${folder.name}: found ${excelFiles.length} Excel files`);
        
        if (excelFiles.length > 0) {
          sectorFiles.push({
            sectorName: folder.name,
            excelFiles,
            totalFiles: excelFiles.length
          });
        }
      }

      const totalFiles = sectorFiles.reduce((sum, sector) => sum + sector.totalFiles, 0);
      console.log(`Total Excel files found across all sectors: ${totalFiles}`);
      
      return sectorFiles;
    } catch (error) {
      console.error('Error getting all sector files:', error);
      return [];
    }
  }
}

export const bucketViewerService = new BucketViewerService();
