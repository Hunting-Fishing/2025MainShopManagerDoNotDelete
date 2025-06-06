
import { supabase } from '@/integrations/supabase/client';

export interface StorageFile {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: string;
  isFolder?: boolean;
}

export interface StorageFolder {
  name: string;
  path: string;
  lastModified: string;
}

export interface BucketInfo {
  exists: boolean;
  files: StorageFile[];
  folders: StorageFolder[];
}

export interface SectorFiles {
  [sectorName: string]: StorageFile[];
}

export class UnifiedStorageService {
  private bucketName = 'service-imports';

  async getBucketInfo(bucketName: string): Promise<BucketInfo> {
    console.log(`🔍 Checking bucket: ${bucketName}`);
    
    try {
      // List all objects in the bucket
      const { data: objects, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`❌ Error accessing bucket ${bucketName}:`, error);
        return { exists: false, files: [], folders: [] };
      }

      if (!objects) {
        console.log(`📁 Bucket ${bucketName} exists but is empty`);
        return { exists: true, files: [], folders: [] };
      }

      console.log(`✅ Found ${objects.length} objects in bucket ${bucketName}`);

      const files: StorageFile[] = [];
      const folders: StorageFolder[] = [];

      objects.forEach(obj => {
        if (obj.metadata?.mimetype || obj.name.includes('.')) {
          // It's a file
          files.push({
            name: obj.name,
            path: obj.name,
            size: obj.metadata?.size || 0,
            type: obj.metadata?.mimetype || 'unknown',
            lastModified: obj.updated_at || obj.created_at || new Date().toISOString(),
            isFolder: false
          });
        } else {
          // It's likely a folder
          folders.push({
            name: obj.name,
            path: obj.name,
            lastModified: obj.updated_at || obj.created_at || new Date().toISOString()
          });
        }
      });

      console.log(`📁 Found ${folders.length} folders and ${files.length} files`);
      folders.forEach(folder => console.log(`  📂 Folder: ${folder.name}`));

      return {
        exists: true,
        files,
        folders
      };
    } catch (error) {
      console.error(`💥 Unexpected error checking bucket ${bucketName}:`, error);
      return { exists: false, files: [], folders: [] };
    }
  }

  async listFiles(bucketName: string, path: string = ''): Promise<StorageFile[]> {
    console.log(`📋 Listing files in ${bucketName}/${path}`);
    
    try {
      const { data: objects, error } = await supabase.storage
        .from(bucketName)
        .list(path, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`❌ Error listing files in ${bucketName}/${path}:`, error);
        return [];
      }

      if (!objects) {
        return [];
      }

      return objects.map(obj => ({
        name: obj.name,
        path: path ? `${path}/${obj.name}` : obj.name,
        size: obj.metadata?.size || 0,
        type: obj.metadata?.mimetype || (obj.name.includes('.') ? 'file' : 'folder'),
        lastModified: obj.updated_at || obj.created_at || new Date().toISOString(),
        isFolder: !obj.metadata?.mimetype && !obj.name.includes('.')
      }));
    } catch (error) {
      console.error(`💥 Unexpected error listing files:`, error);
      return [];
    }
  }

  async getFilesInFolder(bucketName: string, folderPath: string, extensions: string[] = []): Promise<StorageFile[]> {
    console.log(`📂 Getting files in folder: ${bucketName}/${folderPath}`);
    
    try {
      const { data: objects, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: 1000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`❌ Error accessing folder ${folderPath}:`, error);
        return [];
      }

      if (!objects) {
        console.log(`📁 Folder ${folderPath} is empty`);
        return [];
      }

      const files = objects
        .filter(obj => {
          // Only include files (objects with extensions or mime types)
          const isFile = obj.metadata?.mimetype || obj.name.includes('.');
          if (!isFile) return false;
          
          // If extensions filter is provided, check against it
          if (extensions.length > 0) {
            return extensions.some(ext => obj.name.toLowerCase().endsWith(ext.toLowerCase()));
          }
          
          return true;
        })
        .map(obj => ({
          name: obj.name,
          path: `${folderPath}/${obj.name}`,
          size: obj.metadata?.size || 0,
          type: obj.metadata?.mimetype || 'unknown',
          lastModified: obj.updated_at || obj.created_at || new Date().toISOString(),
          isFolder: false
        }));

      console.log(`📄 Found ${files.length} files in ${folderPath}`);
      return files;
    } catch (error) {
      console.error(`💥 Unexpected error getting files in folder:`, error);
      return [];
    }
  }

  async getAllSectorFiles(bucketName: string): Promise<SectorFiles> {
    console.log(`🔄 Getting all sector files from bucket: ${bucketName}`);
    
    try {
      const bucketInfo = await this.getBucketInfo(bucketName);
      
      if (!bucketInfo.exists) {
        console.log(`❌ Bucket ${bucketName} does not exist`);
        return {};
      }

      const sectorFiles: SectorFiles = {};

      // Process each folder as a sector
      for (const folder of bucketInfo.folders) {
        console.log(`📂 Processing sector folder: ${folder.name}`);
        const files = await this.getFilesInFolder(bucketName, folder.name, ['.xlsx', '.xls']);
        sectorFiles[folder.name] = files;
        console.log(`  📄 Found ${files.length} Excel files in ${folder.name}`);
      }

      console.log(`✅ Processed ${Object.keys(sectorFiles).length} sectors`);
      return sectorFiles;
    } catch (error) {
      console.error(`💥 Error getting all sector files:`, error);
      return {};
    }
  }

  async downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
    console.log(`⬇️ Downloading file: ${bucketName}/${filePath}`);
    
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error(`❌ Error downloading file ${filePath}:`, error);
        return null;
      }

      if (!data) {
        console.log(`❌ No data received for file ${filePath}`);
        return null;
      }

      console.log(`✅ Successfully downloaded file: ${filePath}`);
      return data;
    } catch (error) {
      console.error(`💥 Unexpected error downloading file:`, error);
      return null;
    }
  }
}

export const storageService = new UnifiedStorageService();
