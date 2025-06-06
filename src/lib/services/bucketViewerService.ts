
import { supabase } from '@/integrations/supabase/client';
import type { StorageFile, SectorFiles } from './types';

export class BucketViewerService {
  private bucketName = 'service-imports'; // Updated to match console logs

  async getBucketInfo(): Promise<{
    exists: boolean;
    files: StorageFile[];
    folders: { name: string; path: string; lastModified?: Date }[];
  }> {
    try {
      console.log(`Fetching bucket info for: ${this.bucketName}`);
      
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName) || false;
      
      if (!bucketExists) {
        console.log(`Bucket ${this.bucketName} does not exist`);
        return { exists: false, files: [], folders: [] };
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

        if (filesError) throw filesError;
        
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
      return { exists: false, files: [], folders: [] };
    }
  }

  async getFilesInFolder(folderPath: string, extensions: string[] = ['.xlsx']): Promise<StorageFile[]> {
    try {
      console.log(`Fetching all files in folder: ${folderPath}`);
      
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
      if (!bucketInfo.exists) return [];

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
