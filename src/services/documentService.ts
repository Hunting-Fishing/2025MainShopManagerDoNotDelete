import { supabase } from '@/lib/supabase';
import { Document, DocumentCategory, CreateDocumentData, CustomerDocument, DocumentSearchParams } from '@/types/document';

export class DocumentService {
  static async getDocuments(searchParams: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*');

    if (searchParams.search_query) {
      query = query.ilike('title', `%${searchParams.search_query}%`);
    }

    if (searchParams.category_id) {
      query = query.eq('category_id', searchParams.category_id);
    }

    if (searchParams.document_type) {
      query = query.eq('document_type', searchParams.document_type);
    }

    if (searchParams.tags && searchParams.tags.length > 0) {
      query = query.contains('tags', searchParams.tags);
    }

    if (searchParams.work_order_id) {
      query = query.eq('work_order_id', searchParams.work_order_id);
    }

     if (searchParams.customer_id) {
       query = query.eq('customer_id', searchParams.customer_id);
     }

    if (searchParams.limit) {
      query = query.limit(searchParams.limit);
    }

    if (searchParams.offset) {
      query = query.range(searchParams.offset, searchParams.offset + (searchParams.limit || 9) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }

    return data || [];
  }

  static async getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('customer_id', customerId);

      if (error) {
        console.error("Error fetching customer documents:", error);
        throw error;
      }

      return data as CustomerDocument[];
    } catch (error) {
      console.error("Error in getCustomerDocuments:", error);
      throw error;
    }
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select()
        .single();

      if (error) {
        console.error("Error creating document:", error);
        throw error;
      }

      return data as Document;
    } catch (error) {
      console.error("Error in createDocument:", error);
      throw error;
    }
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating document:", error);
        throw error;
      }

      return data as Document;
    } catch (error) {
      console.error("Error in updateDocument:", error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting document:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteDocument:", error);
      throw error;
    }
  }

  static async getCategories(): Promise<DocumentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*');

      if (error) {
        console.error("Error fetching document categories:", error);
        throw error;
      }

      return data as DocumentCategory[];
    } catch (error) {
      console.error("Error in getCategories:", error);
      throw error;
    }
  }

  static async uploadDocumentVersion(
    documentId: string,
    file: File,
    versionNotes?: string
  ) {
    try {
      // Upload file to storage
      const fileName = `${documentId}_v${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`versions/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Create version record
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          file_path: uploadData.path,
          file_size: file.size,
          version_notes: versionNotes, // Fixed variable name
          created_by: 'current_user_id', // Replace with actual user ID
          created_by_name: 'Current User' // Replace with actual user name
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading document version:', error);
      throw error;
    }
  }

  static async uploadFile(file: File, path?: string): Promise<{ path: string; url: string }> {
    try {
      const fileName = path || `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: urlData.publicUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async getDocumentDownloadUrl(filePath: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error;
    }
  }

  static async logAccess(
    documentId: string,
    accessType: string,
    accessedBy: string,
    accessedByName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_access_logs')
        .insert([
          {
            document_id: documentId,
            access_type: accessType,
            accessed_by: accessedBy,
            accessed_by_name: accessedByName,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        ]);

      if (error) {
        console.error('Error logging document access:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in logAccess:', error);
      throw error;
    }
  }
}

export const getCustomerDocuments = DocumentService.getCustomerDocuments.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion.bind(DocumentService);
export const getDocumentDownloadUrl = DocumentService.getDocumentDownloadUrl.bind(DocumentService);
export const uploadDocument = DocumentService.createDocument.bind(DocumentService);
