
import { supabase } from '@/integrations/supabase/client';

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
  isFolder: boolean;
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
  [sectorName: string]: {
    files: StorageFile[];
    folders: StorageFolder[];
  };
}

class UnifiedStorageService {
  private cache = new Map<string, any>();
  private readonly BUCKET_NAME = 'service-imports';

  // Check if bucket exists
  async checkBucketExists(bucketName: string): Promise<boolean> {
    try {
      console.log(`Checking if bucket ${bucketName} exists...`);
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Error listing buckets:', error);
        return false;
      }
      
      const exists = buckets?.some(bucket => bucket.name === bucketName) || false;
      console.log(`Bucket ${bucketName} exists: ${exists}`);
      return exists;
    } catch (error) {
      console.error('Error checking bucket existence:', error);
      return false;
    }
  }

  // Clear cache for a specific bucket
  clearCacheForBucket(bucketName: string): void {
    console.log(`Clearing cache for bucket: ${bucketName}`);
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.startsWith(`${bucketName}_`)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // List files in a specific path
  async listFiles(bucketName: string, path: string = ''): Promise<StorageFile[]> {
    try {
      console.log(`Listing files in ${bucketName}/${path}`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path, {
          limit: 1000,
          offset: 0,
        });

      if (error) {
        console.error('Error listing files:', error);
        throw error;
      }

      if (!data) {
        console.log('No data returned from storage list');
        return [];
      }

      return data.map(item => ({
        name: item.name,
        path: path ? `${path}/${item.name}` : item.name,
        size: item.metadata?.size || 0,
        type: item.metadata?.mimetype || 'unknown',
        lastModified: new Date(item.updated_at || item.created_at || Date.now()),
        isFolder: !item.metadata // Folders don't have metadata
      }));
    } catch (error) {
      console.error('Error in listFiles:', error);
      throw error;
    }
  }

  // Download a file
  async downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
    try {
      console.log(`Downloading file ${bucketName}/${filePath}`);
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error('Error downloading file:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in downloadFile:', error);
      return null;
    }
  }

  // Get bucket info
  async getBucketInfo(bucketName: string): Promise<BucketInfo> {
    const cacheKey = `${bucketName}_info`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`Returning cached bucket info for ${bucketName}`);
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`Getting bucket info for ${bucketName}`);
      
      const exists = await this.checkBucketExists(bucketName);
      if (!exists) {
        const result = { exists: false, files: [], folders: [] };
        this.cache.set(cacheKey, result);
        return result;
      }

      const items = await this.listFiles(bucketName, '');
      const files = items.filter(item => !item.isFolder);
      const folders = items.filter(item => item.isFolder).map(item => ({
        name: item.name,
        path: item.path,
        lastModified: item.lastModified
      }));

      const result = { exists: true, files, folders };
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error getting bucket info:', error);
      const result = { exists: false, files: [], folders: [] };
      this.cache.set(cacheKey, result);
      return result;
    }
  }

  // Get files in a specific folder
  async getFilesInFolder(bucketName: string, folderPath: string, extensions: string[] = []): Promise<StorageFile[]> {
    const cacheKey = `${bucketName}_${folderPath}_files`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`Returning cached files for ${bucketName}/${folderPath}`);
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`Getting files in folder ${bucketName}/${folderPath}`);
      
      const items = await this.listFiles(bucketName, folderPath);
      let files = items.filter(item => !item.isFolder);
      
      // Filter by extensions if provided
      if (extensions.length > 0) {
        files = files.filter(file => 
          extensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()))
        );
      }

      this.cache.set(cacheKey, files);
      return files;
    } catch (error) {
      console.error('Error getting files in folder:', error);
      this.cache.set(cacheKey, []);
      return [];
    }
  }

  // Get all sector files
  async getAllSectorFiles(bucketName: string): Promise<SectorFiles> {
    const cacheKey = `${bucketName}_all_sectors`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`Returning cached sector files for ${bucketName}`);
      return this.cache.get(cacheKey);
    }

    try {
      console.log(`Getting all sector files from ${bucketName}`);
      
      const bucketInfo = await this.getBucketInfo(bucketName);
      if (!bucketInfo.exists) {
        console.log('Bucket does not exist');
        const result: SectorFiles = {};
        this.cache.set(cacheKey, result);
        return result;
      }

      const sectorFiles: SectorFiles = {};
      
      // Process each folder as a sector
      for (const folder of bucketInfo.folders) {
        console.log(`Processing sector folder: ${folder.name}`);
        
        const files = await this.getFilesInFolder(bucketName, folder.path, ['.xlsx']);
        const subFolders = await this.listFiles(bucketName, folder.path);
        const folders = subFolders.filter(item => item.isFolder).map(item => ({
          name: item.name,
          path: item.path,
          lastModified: item.lastModified
        }));
        
        sectorFiles[folder.name] = {
          files,
          folders
        };
      }

      this.cache.set(cacheKey, sectorFiles);
      return sectorFiles;
    } catch (error) {
      console.error('Error getting all sector files:', error);
      const result: SectorFiles = {};
      this.cache.set(cacheKey, result);
      return result;
    }
  }

  // Clear all cache
  clearCache(): void {
    console.log('Clearing all storage cache');
    this.cache.clear();
  }
}

export const storageService = new UnifiedStorageService();
