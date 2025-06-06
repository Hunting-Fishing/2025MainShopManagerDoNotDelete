
import { supabase } from '@/integrations/supabase/client';

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

export interface StorageFolder {
  name: string;
  path: string;
  lastModified: Date;
}

export interface BucketInfo {
  exists: boolean;
  files: StorageFile[];
  folders: StorageFolder[];
}

export interface SectorFiles {
  [sectorName: string]: StorageFile[];
}

class UnifiedStorageService {
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(bucketName: string, path?: string): string {
    return `${bucketName}${path ? `/${path}` : ''}`;
  }

  private isValidCache(cacheItem: any): boolean {
    return cacheItem && (Date.now() - cacheItem.timestamp) < this.cacheTimeout;
  }

  async checkBucketExists(bucketName: string): Promise<boolean> {
    const cacheKey = `bucket_exists_${bucketName}`;
    const cached = this.cache.get(cacheKey);
    
    if (this.isValidCache(cached)) {
      return cached.data;
    }

    try {
      console.log(`Checking if bucket "${bucketName}" exists...`);
      
      // Try to list files in the bucket - if it succeeds, the bucket exists
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });

      if (error) {
        console.warn(`Bucket check error for "${bucketName}":`, error.message);
        // If the error is about bucket not found, return false
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          this.cache.set(cacheKey, { data: false, timestamp: Date.now() });
          return false;
        }
        // For other errors, we might still want to try accessing the bucket
      }

      // If we got data or a non-critical error, assume bucket exists
      const exists = true;
      this.cache.set(cacheKey, { data: exists, timestamp: Date.now() });
      return exists;
    } catch (error) {
      console.error(`Error checking bucket "${bucketName}":`, error);
      this.cache.set(cacheKey, { data: false, timestamp: Date.now() });
      return false;
    }
  }

  async getBucketInfo(bucketName: string): Promise<BucketInfo> {
    const cacheKey = this.getCacheKey(bucketName, 'info');
    const cached = this.cache.get(cacheKey);
    
    if (this.isValidCache(cached)) {
      return cached.data;
    }

    try {
      console.log(`Getting bucket info for "${bucketName}"...`);
      
      // List all items in the bucket root
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list('', { 
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`Error listing bucket "${bucketName}":`, error);
        const result = { exists: false, files: [], folders: [] };
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
        return result;
      }

      const files: StorageFile[] = [];
      const folders: StorageFolder[] = [];

      if (items) {
        for (const item of items) {
          const itemData = {
            name: item.name,
            path: item.name,
            size: item.metadata?.size || 0,
            type: item.metadata?.mimetype || 'unknown',
            lastModified: new Date(item.updated_at || item.created_at)
          };

          // In Supabase Storage, folders don't have a size and might not have metadata
          if (item.metadata?.size !== undefined || item.name.includes('.')) {
            files.push(itemData);
          } else {
            folders.push({
              name: item.name,
              path: item.name,
              lastModified: itemData.lastModified
            });
          }
        }
      }

      const result = { exists: true, files, folders };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error getting bucket info for "${bucketName}":`, error);
      const result = { exists: false, files: [], folders: [] };
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
  }

  async getFilesInFolder(bucketName: string, folderPath: string, extensions: string[] = []): Promise<StorageFile[]> {
    const cacheKey = this.getCacheKey(bucketName, folderPath);
    const cached = this.cache.get(cacheKey);
    
    if (this.isValidCache(cached)) {
      return cached.data;
    }

    try {
      console.log(`Getting files in folder "${folderPath}" from bucket "${bucketName}"...`);
      
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, { 
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`Error listing folder "${folderPath}" in bucket "${bucketName}":`, error);
        this.cache.set(cacheKey, { data: [], timestamp: Date.now() });
        return [];
      }

      let files: StorageFile[] = [];

      if (items) {
        files = items
          .filter(item => {
            // Only include files (items with size or file extensions)
            const hasSize = item.metadata?.size !== undefined;
            const hasExtension = item.name.includes('.');
            const isFile = hasSize || hasExtension;
            
            if (!isFile) return false;
            
            // Filter by extensions if provided
            if (extensions.length > 0) {
              return extensions.some(ext => 
                item.name.toLowerCase().endsWith(ext.toLowerCase())
              );
            }
            
            return true;
          })
          .map(item => ({
            name: item.name,
            path: folderPath ? `${folderPath}/${item.name}` : item.name,
            size: item.metadata?.size || 0,
            type: item.metadata?.mimetype || 'unknown',
            lastModified: new Date(item.updated_at || item.created_at)
          }));
      }

      this.cache.set(cacheKey, { data: files, timestamp: Date.now() });
      return files;
    } catch (error) {
      console.error(`Error getting files in folder "${folderPath}":`, error);
      this.cache.set(cacheKey, { data: [], timestamp: Date.now() });
      return [];
    }
  }

  async getAllSectorFiles(bucketName: string): Promise<SectorFiles> {
    const cacheKey = `${bucketName}_all_sectors`;
    const cached = this.cache.get(cacheKey);
    
    if (this.isValidCache(cached)) {
      return cached.data;
    }

    try {
      console.log(`Getting all sector files from bucket "${bucketName}"...`);
      
      // First get the bucket info to find all folders
      const bucketInfo = await this.getBucketInfo(bucketName);
      
      if (!bucketInfo.exists) {
        console.warn(`Bucket "${bucketName}" does not exist`);
        this.cache.set(cacheKey, { data: {}, timestamp: Date.now() });
        return {};
      }

      const sectorFiles: SectorFiles = {};

      // Get files from each folder (sector)
      for (const folder of bucketInfo.folders) {
        console.log(`Processing sector folder: ${folder.name}`);
        
        const files = await this.getFilesInFolder(bucketName, folder.name, ['.xlsx', '.xls']);
        
        if (files.length > 0) {
          sectorFiles[folder.name] = files;
          console.log(`Found ${files.length} Excel files in sector "${folder.name}"`);
        } else {
          console.log(`No Excel files found in sector "${folder.name}"`);
        }
      }

      console.log(`Total sectors with files: ${Object.keys(sectorFiles).length}`);
      
      this.cache.set(cacheKey, { data: sectorFiles, timestamp: Date.now() });
      return sectorFiles;
    } catch (error) {
      console.error(`Error getting all sector files from bucket "${bucketName}":`, error);
      this.cache.set(cacheKey, { data: {}, timestamp: Date.now() });
      return {};
    }
  }

  async downloadFile(bucketName: string, filePath: string): Promise<ArrayBuffer> {
    try {
      console.log(`Downloading file "${filePath}" from bucket "${bucketName}"...`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error(`Error downloading file "${filePath}":`, error);
        throw new Error(`Failed to download file: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data received from file download');
      }

      return await data.arrayBuffer();
    } catch (error) {
      console.error(`Error downloading file "${filePath}":`, error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Storage service cache cleared');
  }

  clearCacheForBucket(bucketName: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(bucketName)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`Cache cleared for bucket "${bucketName}"`);
  }
}

export const storageService = new UnifiedStorageService();
export type { StorageFile, StorageFolder, BucketInfo, SectorFiles };
