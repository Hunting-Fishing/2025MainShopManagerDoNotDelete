
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export enum FileType {
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  VIDEO = 'video',
  OTHER = 'other'
}

export interface FileUploadResult {
  url: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  contentType: string;
}

export class FileService {
  private static readonly BUCKET_NAME = 'chat-attachments';
  
  /**
   * Upload a file to storage
   */
  static async uploadFile(file: File, userId: string): Promise<FileUploadResult> {
    try {
      // Ensure bucket exists
      await this.ensureBucketExists();
      
      // Determine file type
      const fileType = this.determineFileType(file.type);
      
      // Create path for file
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${fileType}/${uuidv4()}.${fileExt}`;
      
      // Upload file
      const { error: uploadError, data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);
      
      return {
        url: urlData.publicUrl,
        fileType,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from storage
   */
  static async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf(this.BUCKET_NAME) + 1).join('/');
      
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting file:', error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }
  
  /**
   * Ensure the storage bucket exists
   */
  private static async ensureBucketExists(): Promise<void> {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(b => b.name === this.BUCKET_NAME)) {
      const { error } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        throw new Error(`Failed to create storage bucket: ${error.message}`);
      }
    }
  }
  
  /**
   * Determine file type from MIME type
   */
  private static determineFileType(mimeType: string): FileType {
    if (mimeType.startsWith('image/')) {
      return FileType.IMAGE;
    } else if (mimeType.startsWith('audio/')) {
      return FileType.AUDIO;
    } else if (mimeType.startsWith('video/')) {
      return FileType.VIDEO;
    } else if (
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType.includes('text/')
    ) {
      return FileType.DOCUMENT;
    }
    return FileType.OTHER;
  }
}
