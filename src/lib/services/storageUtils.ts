
import { supabase } from '@/integrations/supabase/client';
import type { StorageFile, SectorFiles } from './types';

export async function getStorageBucketInfo(bucketName: string = 'service-data') {
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName) || false;
    
    if (!bucketExists) {
      return { exists: false, files: [], folders: [] };
    }

    const { data: filesList, error: filesError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (filesError) throw filesError;

    const files: StorageFile[] = [];
    const folders: { name: string; path: string; lastModified?: Date }[] = [];

    filesList?.forEach(item => {
      if (item.metadata) {
        files.push({
          name: item.name,
          path: item.name,
          size: item.metadata.size,
          type: item.metadata.mimetype,
          lastModified: new Date(item.updated_at)
        });
      } else {
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

export async function getFolderFiles(bucketName: string, folderPath: string, extensions: string[] = ['.xlsx']): Promise<StorageFile[]> {
  try {
    const { data: filesList, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });

    if (error) throw error;

    return filesList?.filter(item => {
      if (!item.metadata) return false;
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

export async function getAllSectorFiles(bucketName: string = 'service-data'): Promise<SectorFiles[]> {
  try {
    const bucketInfo = await getStorageBucketInfo(bucketName);
    if (!bucketInfo.exists) return [];

    const sectorFiles: SectorFiles[] = [];

    for (const folder of bucketInfo.folders) {
      const excelFiles = await getFolderFiles(bucketName, folder.name);
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
