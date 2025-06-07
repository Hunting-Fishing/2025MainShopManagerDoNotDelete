
import { supabase } from '@/integrations/supabase/client';
import type { SectorFiles, StorageFile } from '@/types/service';

export const bucketViewerService = {
  async getAllSectorFiles(): Promise<SectorFiles[]> {
    try {
      console.log('BucketViewerService: Getting all sector files...');
      
      // First, check if the bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        throw new Error(`Failed to list buckets: ${bucketsError.message}`);
      }
      
      const serviceBucket = buckets?.find(bucket => bucket.name === 'service-data');
      if (!serviceBucket) {
        console.log('service-data bucket not found, creating it...');
        const { error: createError } = await supabase.storage.createBucket('service-data', {
          public: false,
          allowedMimeTypes: [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
          ]
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          throw new Error(`Failed to create service-data bucket: ${createError.message}`);
        }
        
        console.log('Created service-data bucket');
        return []; // Return empty array since we just created the bucket
      }
      
      // List all folders (sectors) in the bucket
      const { data: rootFiles, error: rootError } = await supabase.storage
        .from('service-data')
        .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
      
      if (rootError) {
        console.error('Error listing root folder:', rootError);
        throw new Error(`Failed to list files in service-data bucket: ${rootError.message}`);
      }
      
      if (!rootFiles || rootFiles.length === 0) {
        console.log('No files or folders found in service-data bucket');
        return [];
      }
      
      // Filter for folders (sectors)
      const sectorFolders = rootFiles.filter(item => !item.metadata);
      console.log('Found sector folders:', sectorFolders.map(f => f.name));
      
      const sectorFiles: SectorFiles[] = [];
      
      // For each sector folder, get the Excel files
      for (const folder of sectorFolders) {
        try {
          const { data: folderFiles, error: folderError } = await supabase.storage
            .from('service-data')
            .list(folder.name, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
          
          if (folderError) {
            console.error(`Error listing files in folder ${folder.name}:`, folderError);
            continue;
          }
          
          // Filter for Excel files only
          const excelFiles: StorageFile[] = (folderFiles || [])
            .filter(file => {
              const fileName = file.name.toLowerCase();
              return file.metadata && (
                fileName.endsWith('.xlsx') || 
                fileName.endsWith('.xls')
              );
            })
            .map(file => ({
              name: file.name,
              path: `${folder.name}/${file.name}`,
              size: file.metadata?.size,
              type: file.metadata?.mimetype,
              lastModified: new Date(file.updated_at),
              id: file.id,
              updated_at: file.updated_at,
              created_at: file.created_at,
              last_accessed_at: file.last_accessed_at,
              metadata: file.metadata
            }));
          
          if (excelFiles.length > 0) {
            sectorFiles.push({
              sectorName: folder.name,
              excelFiles,
              totalFiles: excelFiles.length
            });
          }
        } catch (error) {
          console.error(`Error processing folder ${folder.name}:`, error);
          continue;
        }
      }
      
      console.log('BucketViewerService: Retrieved sector files:', sectorFiles.length);
      return sectorFiles;
    } catch (error) {
      console.error('BucketViewerService: Error getting sector files:', error);
      throw error;
    }
  }
};
