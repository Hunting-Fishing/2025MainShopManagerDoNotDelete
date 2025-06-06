
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
      return { exists: false, files: [] };
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      return { exists: false, files: [] };
    }
    
    // Get list of files in the bucket
    const { data: files, error: filesError } = await supabase
      .storage
      .from(bucketName)
      .list();
      
    if (filesError) {
      console.error(`Error fetching files from ${bucketName}:`, filesError);
      return { exists: true, files: [] };
    }
    
    return { 
      exists: true, 
      files: files
        .filter(file => !file.id.endsWith('/')) // Filter out folders
        .map(file => ({
          name: file.name,
          size: file.metadata?.size,
          type: file.metadata?.mimetype,
          lastModified: file.created_at
        })) 
    };
  } catch (error) {
    console.error('Error in getStorageBucketInfo:', error);
    return { exists: false, files: [] };
  }
};
