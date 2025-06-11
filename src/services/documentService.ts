
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentSearchParams, CreateDocumentData, DocumentAccessLog } from '@/types/document';

export class DocumentService {
  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    try {
      const { data, error } = await supabase.rpc('search_documents', {
        p_search_query: params.search_query,
        p_category_id: params.category_id,
        p_document_type: params.document_type,
        p_tags: params.tags,
        p_work_order_id: params.work_order_id,
        p_customer_id: params.customer_id,
        p_limit: params.limit || 50,
        p_offset: params.offset || 0
      });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        document_type: item.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        file_url: item.file_url,
        category_name: item.category_name,
        tags: item.tags || [],
        created_by_name: item.created_by_name,
        created_at: item.created_at,
        updated_at: item.updated_at,
        // Add required fields for Document interface
        is_public: false,
        is_archived: false,
        metadata: {},
        created_by: 'system'
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async getDocumentById(id: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.document_categories?.name
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...documentData,
          created_by: 'current-user',
          created_by_name: 'Current User'
        }])
        .select(`
          *,
          document_categories(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.document_categories?.name
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  static async updateDocument(id: string, updates: Partial<CreateDocumentData>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_by: 'current-user',
          updated_by_name: 'Current User',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          document_categories(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.document_categories?.name
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<DocumentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async uploadFile(file: File, path: string): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  static async logAccess(
    documentId: string,
    accessType: 'view' | 'download' | 'edit' | 'delete',
    accessedBy: string = 'current-user',
    accessedByName: string = 'Current User'
  ): Promise<void> {
    try {
      await supabase.rpc('log_document_access', {
        p_document_id: documentId,
        p_access_type: accessType,
        p_accessed_by: accessedBy,
        p_accessed_by_name: accessedByName
      });
    } catch (error) {
      console.error('Error logging document access:', error);
    }
  }

  static async getAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('document_access_logs')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        access_type: item.access_type as 'view' | 'download' | 'edit' | 'delete'
      }));
    } catch (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
  }

  // Additional functions that were missing
  static async getCustomerDocuments(customerId: string): Promise<Document[]> {
    return this.getDocuments({ customer_id: customerId });
  }

  static async getDocumentCategories(): Promise<DocumentCategory[]> {
    return this.getCategories();
  }

  static async uploadDocument(file: File, documentData: CreateDocumentData): Promise<Document> {
    try {
      // Upload file first
      const timestamp = Date.now();
      const filePath = `${documentData.customer_id || 'general'}/${timestamp}_${file.name}`;
      const fileUrl = await this.uploadFile(file, filePath);

      // Create document record
      const document = await this.createDocument({
        ...documentData,
        file_path: filePath,
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type
      });

      return document;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  static async getDocumentDownloadUrl(document: Document): Promise<string> {
    if (document.file_url) {
      return document.file_url;
    }
    throw new Error('No file URL available for this document');
  }

  static async getDocumentPreviewUrl(document: Document): Promise<string> {
    return this.getDocumentDownloadUrl(document);
  }

  static async uploadDocumentVersion(
    documentId: string,
    file: File,
    versionNotes?: string
  ): Promise<any> {
    try {
      // Get current document
      const document = await this.getDocumentById(documentId);
      if (!document) throw new Error('Document not found');

      // Upload new file
      const timestamp = Date.now();
      const filePath = `versions/${documentId}/${timestamp}_${file.name}`;
      const fileUrl = await this.uploadFile(file, filePath);

      // Create version record
      const { data, error } = await supabase
        .from('document_versions')
        .insert([{
          document_id: documentId,
          version_number: 2, // Should be calculated properly
          file_path: filePath,
          file_size: file.size,
          version_notes: versionNotes,
          created_by: 'current-user',
          created_by_name: 'Current User'
        }])
        .select()
        .single();

      if (error) throw error;

      // Update main document
      await this.updateDocument(documentId, {
        file_path: filePath,
        file_url: fileUrl,
        file_size: file.size
      });

      return data;
    } catch (error) {
      console.error('Error uploading document version:', error);
      throw error;
    }
  }
}

// Export individual functions for backward compatibility
export const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  getCategories,
  uploadFile,
  logAccess,
  getAccessLogs,
  getCustomerDocuments,
  getDocumentCategories,
  uploadDocument,
  getDocumentDownloadUrl,
  getDocumentPreviewUrl,
  uploadDocumentVersion
} = DocumentService;
