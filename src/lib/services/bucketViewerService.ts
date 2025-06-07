
import { getAllSectorFiles, ensureStorageBucket } from './storageUtils';
import type { SectorFiles } from '@/types/service';

export const bucketViewerService = {
  async getAllSectorFiles(): Promise<SectorFiles[]> {
    try {
      console.log('BucketViewerService: Getting all sector files...');
      
      // Ensure bucket exists first
      const bucketReady = await ensureStorageBucket();
      if (!bucketReady) {
        console.log('BucketViewerService: Bucket not ready');
        return [];
      }
      
      const result = await getAllSectorFiles();
      console.log('BucketViewerService: Retrieved sector files:', result.length);
      return result;
    } catch (error) {
      console.error('BucketViewerService: Error getting sector files:', error);
      return [];
    }
  }
};
