
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentSearchParams, CreateDocumentData, DocumentAccessLog, DocumentVersion, CustomerDocument } from '@/types/document';

export class DocumentService {
  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          document_categories!inner(name)
        `)
        .eq('is_archived', false);

      if (params.search_query) {
        query = query.or(`title.ilike.%${params.search_query}%,description.ilike.%${params.search_query}%`);
      }

      if (params.category_id) {
        query = query.eq('category_id', params.category_id);
      }

      if (params.document_type) {
        query = query.eq('document_type', params.document_type);
      }

      if (params.work_order_id) {
        query = query.eq('work_order_id', params.work_order_id);
      }

      if (params.customer_id) {
        query = query.eq('customer_id', params.customer_id);
      }

      if (params.tags && params.tags.length > 0) {
        query = query.overlaps('tags', params.tags);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        document_type: item.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: (item.metadata as any) || {},
        category_name: item.document_categories?.name || null,
      })) as Document[];

    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  static async getDocument(id: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories!inner(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: (data.metadata as any) || {},
        category_name: data.document_categories?.name || null,
      } as Document;

    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          created_by: 'current-user', // In real app, this would be auth.uid()
          created_by_name: 'Current User',
          metadata: documentData.metadata || {},
        })
        .select(`
          *,
          document_categories!inner(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: (data.metadata as any) || {},
        category_name: data.document_categories?.name || null,
      } as Document;

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
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          document_categories!inner(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: (data.metadata as any) || {},
        category_name: data.document_categories?.name || null,
      } as Document;

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
      return [];
    }
  }

  static async uploadFile(file: File, path?: string): Promise<string> {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
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

      return data.map(item => ({
        ...item,
        access_type: item.access_type as 'view' | 'download' | 'edit' | 'delete',
      })) as DocumentAccessLog[];

    } catch (error) {
      console.error('Error fetching access logs:', error);
      return [];
    }
  }

  // Customer-specific document functions
  static async getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories(name)
        `)
        .eq('customer_id', customerId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        customer_id: item.customer_id!, // Force non-null for CustomerDocument
        document_type: item.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: (item.metadata as any) || {},
        category_name: item.document_categories?.name || null,
      })) as CustomerDocument[];

    } catch (error) {
      console.error('Error fetching customer documents:', error);
      return [];
    }
  }

  static async uploadDocument(file: File, customerId: string, metadata?: any): Promise<CustomerDocument> {
    try {
      // Upload file first
      const fileUrl = await this.uploadFile(file, `customers/${customerId}`);
      
      // Create document record
      const documentData: CreateDocumentData = {
        title: file.name,
        document_type: file.type.startsWith('image/') ? 'image' : 'pdf',
        file_url: fileUrl,
        file_size: file.size,
        mime_type: file.type,
        customer_id: customerId,
        metadata: metadata || {},
      };

      const document = await this.createDocument(documentData);
      return { ...document, customer_id: customerId } as CustomerDocument;

    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  static async uploadDocumentVersion(documentId: string, file: File, versionNotes?: string): Promise<DocumentVersion> {
    try {
      // Upload new version file
      const fileUrl = await this.uploadFile(file, `versions/${documentId}`);
      
      // Get current version count
      const { data: versions, error: versionError } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionError) throw versionError;

      const nextVersionNumber = (versions?.[0]?.version_number || 0) + 1;

      // Create version record
      const { data, error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          version_number: nextVersionNumber,
          file_path: fileUrl,
          file_size: file.size,
          version_notes: versionNotes,
          created_by: 'current-user',
          created_by_name: 'Current User',
        })
        .select()
        .single();

      if (error) throw error;
      return data as DocumentVersion;

    } catch (error) {
      console.error('Error uploading document version:', error);
      throw error;
    }
  }

  static async getDocumentDownloadUrl(document: Document): Promise<string> {
    if (document.file_url) {
      return document.file_url;
    }
    throw new Error('No file URL available for download');
  }

  static async getDocumentPreviewUrl(document: Document): Promise<string> {
    if (document.file_url) {
      return document.file_url;
    }
    throw new Error('No file URL available for preview');
  }
}

// Export individual functions for backward compatibility
export const getDocuments = DocumentService.getDocuments.bind(DocumentService);
export const getDocument = DocumentService.getDocument.bind(DocumentService);
export const createDocument = DocumentService.createDocument.bind(DocumentService);
export const updateDocument = DocumentService.updateDocument.bind(DocumentService);
export const deleteDocument = DocumentService.deleteDocument.bind(DocumentService);
export const getCategories = DocumentService.getCategories.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);
export const getCustomerDocuments = DocumentService.getCustomerDocuments.bind(DocumentService);
export const uploadDocument = DocumentService.uploadDocument.bind(DocumentService);
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion.bind(DocumentService);
export const getDocumentDownloadUrl = DocumentService.getDocumentDownloadUrl.bind(DocumentService);
export const getDocumentPreviewUrl = DocumentService.getDocumentPreviewUrl.bind(DocumentService);
