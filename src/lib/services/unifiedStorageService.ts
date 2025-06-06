
import { supabase } from '@/integrations/supabase/client';

export interface StorageFile {
  name: string;
  path: string;
  size?: number;
  type?: string;
  lastModified?: string;
  isFolder?: boolean;
}

export interface StorageBucketInfo {
  exists: boolean;
  files: StorageFile[];
  folders: StorageFile[];
  error?: string;
}

export interface SectorFiles {
  [sectorName: string]: StorageFile[];
}

class UnifiedStorageService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async checkBucketExists(bucketName: string): Promise<boolean> {
    try {
      const cacheKey = `bucket_exists_${bucketName}`;
      const cached = this.getFromCache<boolean>(cacheKey);
      if (cached !== null) return cached;

      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error checking buckets:', error);
        return false;
      }

      const exists = buckets?.some(bucket => bucket.name === bucketName) || false;
      this.setCache(cacheKey, exists);
      return exists;
    } catch (error) {
      console.error('Error in checkBucketExists:', error);
      return false;
    }
  }

  async listFiles(bucketName: string, folderPath: string = '', options: { limit?: number } = {}): Promise<StorageFile[]> {
    try {
      const cacheKey = `files_${bucketName}_${folderPath}`;
      const cached = this.getFromCache<StorageFile[]>(cacheKey);
      if (cached !== null) return cached;

      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, { 
          limit: options.limit || 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`Error listing files in ${bucketName}/${folderPath}:`, error);
        return [];
      }

      if (!items) return [];

      const files: StorageFile[] = items.map(item => {
        const isFolder = !item.name.includes('.') || item.id === null;
        const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
        
        return {
          name: item.name,
          path: fullPath,
          size: item.metadata?.size,
          type: item.metadata?.mimetype || (isFolder ? 'folder' : 'file'),
          lastModified: item.created_at || item.updated_at,
          isFolder
        };
      });

      this.setCache(cacheKey, files);
      return files;
    } catch (error) {
      console.error('Error in listFiles:', error);
      return [];
    }
  }

  async getFolders(bucketName: string, folderPath: string = ''): Promise<StorageFile[]> {
    const files = await this.listFiles(bucketName, folderPath);
    return files.filter(file => file.isFolder);
  }

  async getFilesInFolder(bucketName: string, folderPath: string, fileExtensions?: string[]): Promise<StorageFile[]> {
    const files = await this.listFiles(bucketName, folderPath);
    let filteredFiles = files.filter(file => !file.isFolder);

    if (fileExtensions && fileExtensions.length > 0) {
      filteredFiles = filteredFiles.filter(file => 
        fileExtensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()))
      );
    }

    return filteredFiles;
  }

  async getBucketInfo(bucketName: string): Promise<StorageBucketInfo> {
    try {
      const cacheKey = `bucket_info_${bucketName}`;
      const cached = this.getFromCache<StorageBucketInfo>(cacheKey);
      if (cached !== null) return cached;

      const exists = await this.checkBucketExists(bucketName);
      
      if (!exists) {
        const result = { exists: false, files: [], folders: [] };
        this.setCache(cacheKey, result);
        return result;
      }

      const allItems = await this.listFiles(bucketName);
      const folders = allItems.filter(item => item.isFolder);
      const files = allItems.filter(item => !item.isFolder);

      const result = { exists: true, files, folders };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in getBucketInfo:', error);
      return { 
        exists: false, 
        files: [], 
        folders: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getAllSectorFiles(bucketName: string, fileExtensions: string[] = ['.xlsx', '.xls']): Promise<SectorFiles> {
    try {
      const cacheKey = `sector_files_${bucketName}`;
      const cached = this.getFromCache<SectorFiles>(cacheKey);
      if (cached !== null) return cached;

      const bucketInfo = await this.getBucketInfo(bucketName);
      
      if (!bucketInfo.exists) {
        console.log(`Bucket ${bucketName} does not exist`);
        return {};
      }

      const sectorFiles: SectorFiles = {};
      
      // Get files from each folder (sector)
      for (const folder of bucketInfo.folders) {
        console.log(`Checking folder: ${folder.name}`);
        const files = await this.getFilesInFolder(bucketName, folder.name, fileExtensions);
        
        if (files.length > 0) {
          sectorFiles[folder.name] = files;
          console.log(`Found ${files.length} files in ${folder.name}:`, files.map(f => f.name));
        }
      }

      console.log('All sector files:', sectorFiles);
      this.setCache(cacheKey, sectorFiles);
      return sectorFiles;
    } catch (error) {
      console.error('Error in getAllSectorFiles:', error);
      return {};
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForBucket(bucketName: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(bucketName)) {
        this.cache.delete(key);
      }
    }
  }
}

export const storageService = new UnifiedStorageService();
