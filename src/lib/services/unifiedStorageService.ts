
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
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(bucketName: string, operation: string, ...params: any[]): string {
    return `${bucketName}:${operation}:${params.join(':')}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  async checkBucketExists(bucketName: string): Promise<boolean> {
    const cacheKey = this.getCacheKey(bucketName, 'exists');
    const cached = this.getCache(cacheKey);
    if (cached !== null) return cached;

    try {
      console.log(`Checking if bucket '${bucketName}' exists...`);
      
      // Try to list files in the bucket to check if it exists
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 });

      if (error) {
        console.log(`Bucket '${bucketName}' check failed:`, error.message);
        // If error contains "not found" or similar, bucket doesn't exist
        const exists = !error.message.includes('not found') && !error.message.includes('does not exist');
        this.setCache(cacheKey, exists);
        return exists;
      }

      console.log(`Bucket '${bucketName}' exists and is accessible`);
      this.setCache(cacheKey, true);
      return true;
    } catch (err) {
      console.error(`Error checking bucket '${bucketName}':`, err);
      this.setCache(cacheKey, false);
      return false;
    }
  }

  async getBucketInfo(bucketName: string): Promise<BucketInfo> {
    const cacheKey = this.getCacheKey(bucketName, 'info');
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Getting bucket info for '${bucketName}'...`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 100 });

      if (error) {
        console.error(`Error getting bucket info for '${bucketName}':`, error);
        const result = { exists: false, files: [], folders: [] };
        this.setCache(cacheKey, result);
        return result;
      }

      const files: StorageFile[] = [];
      const folders: StorageFolder[] = [];

      data.forEach(item => {
        const commonProps = {
          name: item.name,
          path: item.name,
          lastModified: new Date(item.updated_at || item.created_at || Date.now())
        };

        if (item.metadata?.mimetype || item.name.includes('.')) {
          files.push({
            ...commonProps,
            size: item.metadata?.size || 0,
            type: item.metadata?.mimetype || 'application/octet-stream'
          });
        } else {
          folders.push(commonProps);
        }
      });

      console.log(`Found ${files.length} files and ${folders.length} folders in '${bucketName}'`);
      
      const result = { exists: true, files, folders };
      this.setCache(cacheKey, result);
      return result;
    } catch (err) {
      console.error(`Unexpected error getting bucket info for '${bucketName}':`, err);
      const result = { exists: false, files: [], folders: [] };
      this.setCache(cacheKey, result);
      return result;
    }
  }

  async getFilesInFolder(bucketName: string, folderPath: string, extensions: string[] = []): Promise<StorageFile[]> {
    const cacheKey = this.getCacheKey(bucketName, 'folder', folderPath, extensions.join(','));
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Getting files in folder '${folderPath}' from bucket '${bucketName}'...`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, { limit: 100 });

      if (error) {
        console.error(`Error getting files in folder '${folderPath}':`, error);
        this.setCache(cacheKey, []);
        return [];
      }

      const files = data
        .filter(item => {
          // Filter for files (not folders)
          const isFile = item.metadata?.mimetype || item.name.includes('.');
          if (!isFile) return false;

          // Filter by extensions if provided
          if (extensions.length > 0) {
            return extensions.some(ext => item.name.toLowerCase().endsWith(ext.toLowerCase()));
          }
          return true;
        })
        .map(item => ({
          name: item.name,
          path: folderPath ? `${folderPath}/${item.name}` : item.name,
          size: item.metadata?.size || 0,
          type: item.metadata?.mimetype || 'application/octet-stream',
          lastModified: new Date(item.updated_at || item.created_at || Date.now())
        }));

      console.log(`Found ${files.length} files in folder '${folderPath}'`);
      this.setCache(cacheKey, files);
      return files;
    } catch (err) {
      console.error(`Unexpected error getting files in folder '${folderPath}':`, err);
      this.setCache(cacheKey, []);
      return [];
    }
  }

  async getAllSectorFiles(bucketName: string): Promise<SectorFiles> {
    const cacheKey = this.getCacheKey(bucketName, 'sectors');
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      console.log(`Getting all sector files from bucket '${bucketName}'...`);
      
      const bucketInfo = await this.getBucketInfo(bucketName);
      if (!bucketInfo.exists) {
        console.log(`Bucket '${bucketName}' does not exist`);
        this.setCache(cacheKey, {});
        return {};
      }

      const sectorFiles: SectorFiles = {};

      // Get files in root directory
      const rootFiles = await this.getFilesInFolder(bucketName, '', ['.xlsx', '.xls', '.csv']);
      if (rootFiles.length > 0) {
        sectorFiles['root'] = rootFiles;
      }

      // Get files in each folder (representing sectors)
      for (const folder of bucketInfo.folders) {
        const folderFiles = await this.getFilesInFolder(bucketName, folder.name, ['.xlsx', '.xls', '.csv']);
        if (folderFiles.length > 0) {
          sectorFiles[folder.name] = folderFiles;
        }
      }

      console.log(`Found files in ${Object.keys(sectorFiles).length} sectors`);
      this.setCache(cacheKey, sectorFiles);
      return sectorFiles;
    } catch (err) {
      console.error(`Error getting sector files from bucket '${bucketName}':`, err);
      this.setCache(cacheKey, {});
      return {};
    }
  }

  async downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
    try {
      console.log(`Downloading file '${filePath}' from bucket '${bucketName}'...`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error(`Error downloading file '${filePath}':`, error);
        return null;
      }

      console.log(`Successfully downloaded file '${filePath}'`);
      return data;
    } catch (err) {
      console.error(`Unexpected error downloading file '${filePath}':`, err);
      return null;
    }
  }

  clearCacheForBucket(bucketName: string): void {
    console.log(`Clearing cache for bucket '${bucketName}'`);
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(`${bucketName}:`));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearAllCache(): void {
    console.log('Clearing all storage cache');
    this.cache.clear();
  }
}

export const storageService = new UnifiedStorageService();
