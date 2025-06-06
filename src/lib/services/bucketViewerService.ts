
import { supabase } from '@/integrations/supabase/client';
import type { StorageFile, SectorFiles } from './types';

export class BucketViewerService {
  private bucketName = 'service-data';

  async getBucketInfo(): Promise<{
    exists: boolean;
    files: StorageFile[];
    folders: { name: string; path: string; lastModified?: Date }[];
  }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;
      
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName) || false;
      
      if (!bucketExists) {
        return { exists: false, files: [], folders: [] };
      }

      // List all files in the bucket
      const { data: filesList, error: filesError } = await supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

      if (filesError) throw filesError;

      const files: StorageFile[] = [];
      const folders: { name: string; path: string; lastModified?: Date }[] = [];

      filesList?.forEach(item => {
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

      return { exists: true, files, folders };
    } catch (error) {
      console.error('Error getting bucket info:', error);
      return { exists: false, files: [], folders: [] };
    }
  }

  async getFilesInFolder(folderPath: string, extensions: string[] = ['.xlsx']): Promise<StorageFile[]> {
    try {
      const { data: filesList, error } = await supabase.storage
        .from(this.bucketName)
        .list(folderPath, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

      if (error) throw error;

      return filesList?.filter(item => {
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
      })) || [];
    } catch (error) {
      console.error(`Error getting files in folder ${folderPath}:`, error);
      return [];
    }
  }

  async getAllSectorFiles(): Promise<SectorFiles[]> {
    try {
      const bucketInfo = await this.getBucketInfo();
      if (!bucketInfo.exists) return [];

      const sectorFiles: SectorFiles[] = [];

      for (const folder of bucketInfo.folders) {
        const excelFiles = await this.getFilesInFolder(folder.name);
        if (excelFiles.length > 0) {
          sectorFiles.push({
            sectorName: folder.name,
            excelFiles,
            totalFiles: excelFiles.length
          });
        }
      }

      return sectorFiles;
    } catch (error) {
      console.error('Error getting all sector files:', error);
      return [];
    }
  }
}

export const bucketViewerService = new BucketViewerService();
