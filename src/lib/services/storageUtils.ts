
import { supabase } from '@/integrations/supabase/client';
import { StorageFile, SectorFiles } from '@/types/service';

export async function getStorageBucketInfo(bucketName: string = 'service-data') {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName) || false;
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} does not exist`);
      return { exists: false, files: [], folders: [] };
    }

    // List all items in the root of the bucket
    const { data: filesList, error: filesError } = await supabase.storage
      .from(bucketName)
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
          lastModified: new Date(item.updated_at),
          id: item.id,
          updated_at: item.updated_at,
          created_at: item.created_at,
          last_accessed_at: item.last_accessed_at,
          metadata: item.metadata
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

export async function getFolderFiles(bucketName: string, folderPath: string, extensions: string[] = ['.xlsx', '.xls']): Promise<StorageFile[]> {
  try {
    console.log(`Getting files from folder: ${folderPath} in bucket: ${bucketName}`);
    
    const { data: filesList, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
      console.error(`Error listing files in folder ${folderPath}:`, error);
      throw error;
    }

    if (!filesList) {
      console.log(`No files found in folder: ${folderPath}`);
      return [];
    }

    const excelFiles = filesList
      .filter(item => {
        // Only include files (items with metadata) and filter by extensions
        if (!item.metadata) return false;
        
        const hasValidExtension = extensions.length === 0 || 
          extensions.some(ext => item.name.toLowerCase().endsWith(ext.toLowerCase()));
        
        return hasValidExtension;
      })
      .map(item => ({
        name: item.name,
        path: `${folderPath}/${item.name}`,
        size: item.metadata?.size,
        type: item.metadata?.mimetype,
        lastModified: new Date(item.updated_at),
        id: item.id,
        updated_at: item.updated_at,
        created_at: item.created_at,
        last_accessed_at: item.last_accessed_at,
        metadata: item.metadata
      }));

    console.log(`Found ${excelFiles.length} Excel files in folder: ${folderPath}`);
    return excelFiles;
  } catch (error) {
    console.error(`Error getting files in folder ${folderPath}:`, error);
    return [];
  }
}

export async function getAllSectorFiles(bucketName: string = 'service-data'): Promise<SectorFiles[]> {
  try {
    console.log(`Getting all sector files from bucket: ${bucketName}`);
    
    const bucketInfo = await getStorageBucketInfo(bucketName);
    if (!bucketInfo.exists) {
      console.log(`Bucket ${bucketName} does not exist`);
      return [];
    }

    const sectorFiles: SectorFiles[] = [];

    // Process each folder (sector) 
    for (const folder of bucketInfo.folders) {
      console.log(`Processing sector folder: ${folder.name}`);
      
      const excelFiles = await getFolderFiles(bucketName, folder.name);
      
      if (excelFiles.length > 0) {
        sectorFiles.push({
          sectorName: folder.name,
          excelFiles,
          totalFiles: excelFiles.length
        });
        
        console.log(`Added sector: ${folder.name} with ${excelFiles.length} files`);
      }
    }

    console.log(`Found ${sectorFiles.length} sectors with Excel files`);
    return sectorFiles;
  } catch (error) {
    console.error('Error getting all sector files:', error);
    return [];
  }
}

export async function ensureStorageBucket(bucketName: string = 'service-data'): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make it public so we can access files
        allowedMimeTypes: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ]
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }
      
      console.log(`Successfully created bucket: ${bucketName}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
}

// Helper function to get the full storage URL for a file
export function getStorageFileUrl(bucketName: string, filePath: string): string {
  return `${supabase.supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
}

// Helper function to parse storage URL and extract bucket name and file path
export function parseStorageUrl(url: string): { bucketName: string; filePath: string } | null {
  try {
    const urlParts = url.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return null;
    
    const pathParts = urlParts[1].split('/');
    if (pathParts.length < 2) return null;
    
    const bucketName = pathParts[0];
    const filePath = pathParts.slice(1).join('/');
    
    return { bucketName, filePath };
  } catch (error) {
    console.error('Error parsing storage URL:', error);
    return null;
  }
}
