
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
  sectorName: string;
  excelFiles: StorageFile[];
  totalFiles: number;
}

class UnifiedStorageService {
  async getBucketInfo(bucketName: string): Promise<BucketInfo> {
    try {
      // List all items in the bucket (no limit)
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list('', {
          limit: 1000, // Increased limit
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listing bucket contents:', error);
        return {
          exists: false,
          files: [],
          folders: []
        };
      }

      if (!items) {
        return {
          exists: false,
          files: [],
          folders: []
        };
      }

      const files: StorageFile[] = [];
      const folders: StorageFolder[] = [];

      for (const item of items) {
        if (item.name && item.name !== '.emptyFolderPlaceholder') {
          const itemData = {
            name: item.name,
            path: item.name,
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date()
          };

          if (item.metadata && 'size' in item.metadata) {
            // It's a file
            files.push({
              ...itemData,
              size: item.metadata.size as number,
              type: item.metadata.mimetype as string || 'application/octet-stream'
            });
          } else {
            // It's a folder
            folders.push(itemData);
          }
        }
      }

      return {
        exists: true,
        files,
        folders
      };
    } catch (error) {
      console.error('Error in getBucketInfo:', error);
      return {
        exists: false,
        files: [],
        folders: []
      };
    }
  }

  async getFilesInFolder(
    bucketName: string, 
    folderPath: string, 
    allowedExtensions: string[] = []
  ): Promise<StorageFile[]> {
    try {
      // List all files in the folder (no limit)
      const { data: items, error } = await supabase.storage
        .from(bucketName)
        .list(folderPath, {
          limit: 1000, // Increased limit
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error(`Error listing folder ${folderPath}:`, error);
        return [];
      }

      if (!items) {
        return [];
      }

      const files: StorageFile[] = [];

      for (const item of items) {
        if (!item.name || item.name === '.emptyFolderPlaceholder') {
          continue;
        }

        // Check if it's a file (has metadata with size)
        if (item.metadata && 'size' in item.metadata) {
          const fileName = item.name.toLowerCase();
          
          // Filter by allowed extensions if specified
          if (allowedExtensions.length > 0) {
            const hasAllowedExtension = allowedExtensions.some(ext => 
              fileName.endsWith(ext.toLowerCase())
            );
            if (!hasAllowedExtension) {
              continue;
            }
          }

          files.push({
            name: item.name,
            path: `${folderPath}/${item.name}`,
            size: item.metadata.size as number,
            type: item.metadata.mimetype as string || 'application/octet-stream',
            lastModified: item.updated_at ? new Date(item.updated_at) : new Date()
          });
        }
      }

      return files;
    } catch (error) {
      console.error(`Error in getFilesInFolder for ${folderPath}:`, error);
      return [];
    }
  }

  async getAllSectorFiles(bucketName: string): Promise<SectorFiles[]> {
    try {
      // First get all folders (sectors)
      const bucketInfo = await this.getBucketInfo(bucketName);
      
      if (!bucketInfo.exists || bucketInfo.folders.length === 0) {
        console.warn('No sectors found in bucket');
        return [];
      }

      const sectorFiles: SectorFiles[] = [];

      // Process each sector folder
      for (const folder of bucketInfo.folders) {
        const excelFiles = await this.getFilesInFolder(bucketName, folder.name, ['.xlsx']);
        
        sectorFiles.push({
          sectorName: folder.name,
          excelFiles,
          totalFiles: excelFiles.length
        });
      }

      // Sort by sector name for consistent display
      sectorFiles.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

      return sectorFiles;
    } catch (error) {
      console.error('Error in getAllSectorFiles:', error);
      return [];
    }
  }

  async downloadFile(bucketName: string, filePath: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);

      if (error) {
        console.error(`Error downloading file ${filePath}:`, error);
        return null;
      }

      return data;
    } catch (error) {
      console.error(`Error in downloadFile for ${filePath}:`, error);
      return null;
    }
  }
}

export const storageService = new UnifiedStorageService();
