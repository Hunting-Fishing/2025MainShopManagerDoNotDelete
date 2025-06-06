
import { storageService, type StorageFile, type SectorFiles } from './unifiedStorageService';

/**
 * @deprecated Use storageService.getBucketInfo() instead
 */
export const getStorageBucketInfo = async (bucketName: string) => {
  const info = await storageService.getBucketInfo(bucketName);
  return {
    exists: info.exists,
    files: info.files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })),
    folders: info.folders.map(folder => ({
      name: folder.name,
      path: folder.path,
      lastModified: folder.lastModified
    }))
  };
};

/**
 * @deprecated Use storageService.getFilesInFolder() instead
 */
export const getFolderFiles = async (bucketName: string, folderPath: string) => {
  const files = await storageService.getFilesInFolder(bucketName, folderPath, ['.xlsx']);
  return files.map(file => ({
    name: file.name,
    path: file.path,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  }));
};

/**
 * @deprecated Use storageService.getAllSectorFiles() instead
 */
export const getAllSectorFiles = async (bucketName: string) => {
  return await storageService.getAllSectorFiles(bucketName);
};
