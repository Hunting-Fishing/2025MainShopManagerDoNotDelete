
import { supabase } from '@/integrations/supabase/client';

/**
 * Get information about a storage bucket including existence and file list
 * @param bucketName The name of the bucket to check
 * @returns Object containing bucket existence status and file list
 */
export const getStorageBucketInfo = async (bucketName: string) => {
  try {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error fetching buckets:', bucketsError);
      return { exists: false, files: [], folders: [] };
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      return { exists: false, files: [], folders: [] };
    }
    
    // Get list of folders and files in the bucket
    const { data: items, error: itemsError } = await supabase
      .storage
      .from(bucketName)
      .list('', { limit: 100 });
      
    if (itemsError) {
      console.error(`Error fetching items from ${bucketName}:`, itemsError);
      return { exists: true, files: [], folders: [] };
    }
    
    const folders = items
      .filter(item => item.id && item.id.endsWith('/'))
      .map(folder => ({
        name: folder.name,
        path: folder.id,
        lastModified: folder.created_at
      }));
    
    const files = items
      .filter(item => !item.id?.endsWith('/'))
      .map(file => ({
        name: file.name,
        size: file.metadata?.size,
        type: file.metadata?.mimetype,
        lastModified: file.created_at
      }));
    
    return { 
      exists: true, 
      files,
      folders
    };
  } catch (error) {
    console.error('Error in getStorageBucketInfo:', error);
    return { exists: false, files: [], folders: [] };
  }
};

/**
 * Get files within a specific folder in the storage bucket
 * @param bucketName The name of the bucket
 * @param folderPath The path to the folder
 * @returns Array of files in the folder
 */
export const getFolderFiles = async (bucketName: string, folderPath: string) => {
  try {
    const { data: files, error } = await supabase
      .storage
      .from(bucketName)
      .list(folderPath, { limit: 100 });
      
    if (error) {
      console.error(`Error fetching files from ${bucketName}/${folderPath}:`, error);
      return [];
    }
    
    return files
      .filter(file => !file.id?.endsWith('/') && file.name.toLowerCase().includes('.xlsx'))
      .map(file => ({
        name: file.name,
        path: `${folderPath}/${file.name}`,
        size: file.metadata?.size,
        type: file.metadata?.mimetype,
        lastModified: file.created_at
      }));
  } catch (error) {
    console.error('Error in getFolderFiles:', error);
    return [];
  }
};

/**
 * Get all Excel files from all sector folders
 * @param bucketName The name of the bucket
 * @returns Object mapping sector names to their Excel files
 */
export const getAllSectorFiles = async (bucketName: string) => {
  try {
    const bucketInfo = await getStorageBucketInfo(bucketName);
    
    if (!bucketInfo.exists || bucketInfo.folders.length === 0) {
      return {};
    }
    
    const sectorFiles: Record<string, any[]> = {};
    
    // Get files from each sector folder
    for (const folder of bucketInfo.folders) {
      const files = await getFolderFiles(bucketName, folder.name);
      if (files.length > 0) {
        sectorFiles[folder.name] = files;
      }
    }
    
    return sectorFiles;
  } catch (error) {
    console.error('Error in getAllSectorFiles:', error);
    return {};
  }
};
