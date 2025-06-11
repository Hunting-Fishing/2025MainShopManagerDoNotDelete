import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentSearchParams, CreateDocumentData, DocumentAccessLog } from '@/types/document';

export class DocumentService {
  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select(`
        *,
        document_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .order('created_at', { ascending: false });

    if (params.search_query) {
      query = query.ilike('title', `%${params.search_query}%`);
    }

    if (params.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    if (params.document_type) {
      query = query.eq('document_type', params.document_type);
    }

    if (params.tags && params.tags.length > 0) {
      query = query.contains('tags', params.tags);
    }

    if (params.work_order_id) {
      query = query.eq('work_order_id', params.work_order_id);
    }

    if (params.customer_id) {
      query = query.eq('customer_id', params.customer_id);
    }

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data.map(doc => ({
      ...doc,
      document_type: doc.document_type as Document['document_type'],
      metadata: (doc.metadata as Record<string, any>) || {},
      category_name: doc.document_categories?.name
    }));
  }

  static async getDocument(id: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      ...data,
      document_type: data.document_type as Document['document_type'],
      metadata: (data.metadata as Record<string, any>) || {},
      category_name: data.document_categories?.name
    };
  }

  static async getCustomerDocuments(customerId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(doc => ({
      ...doc,
      document_type: doc.document_type as Document['document_type'],
      metadata: (doc.metadata as Record<string, any>) || {},
      category_name: doc.document_categories?.name
    }));
  }

  static async createDocument(data: CreateDocumentData): Promise<Document> {
    const { data: newDocument, error } = await supabase
      .from('documents')
      .insert([data])
      .select(`
        *,
        document_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .single();

    if (error) {
      console.error("Error creating document:", error);
      throw new Error(`Failed to create document: ${error.message}`);
    }

    return {
      ...newDocument,
      document_type: newDocument.document_type as Document['document_type'],
      metadata: (newDocument.metadata as Record<string, any>) || {},
      category_name: newDocument.document_categories?.name
    };
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data: updatedDocument, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        document_categories (
          id,
          name,
          color,
          icon
        )
      `)
      .single();

    if (error) {
      console.error("Error updating document:", error);
      throw new Error(`Failed to update document: ${error.message}`);
    }

    return {
      ...updatedDocument,
      document_type: updatedDocument.document_type as Document['document_type'],
      metadata: (updatedDocument.metadata as Record<string, any>) || {},
      category_name: updatedDocument.document_categories?.name
    };
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting document:", error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  static async getCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async searchDocuments(params: DocumentSearchParams): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select(`
        id,
        title,
        description,
        document_type,
        file_url,
        category_name,
        tags,
        created_by_name,
        created_at,
        updated_at,
        relevance_score
      `);

    if (params.search_query) {
      query = query.textSearch('title', params.search_query);
    }

    if (params.category_id) {
      query = query.eq('category_id', params.category_id);
    }

    if (params.document_type) {
      query = query.eq('document_type', params.document_type);
    }

    if (params.customer_id) {
      query = query.eq('customer_id', params.customer_id);
    }

    if (params.work_order_id) {
      query = query.eq('work_order_id', params.work_order_id);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(params.limit || 50);

    if (error) throw error;

    return data.map(doc => ({
      ...doc,
      document_type: doc.document_type as Document['document_type'],
      is_public: false,
      is_archived: false,
      metadata: {},
      created_by: '',
      tags: doc.tags || []
    }));
  }

  static async uploadDocument(file: File, metadata: CreateDocumentData): Promise<Document> {
    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Create document record
    const documentData = {
      ...metadata,
      file_path: filePath,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      created_by: 'current-user', // TODO: Get from auth
      created_by_name: 'Current User' // TODO: Get from auth
    };

    return this.createDocument(documentData);
  }

  static async uploadDocumentVersion(documentId: string, file: File, versionNotes?: string): Promise<void> {
    // Implementation for document versioning
    // This would upload a new version and create a version record
    throw new Error('Document versioning not implemented yet');
  }

  static async getDocumentDownloadUrl(document: Document): Promise<string> {
    if (document.file_url) {
      return document.file_url;
    }
    
    if (document.file_path) {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(document.file_path);
      return data.publicUrl;
    }
    
    throw new Error('No file URL or path available');
  }

  static async getDocumentPreviewUrl(document: Document): Promise<string> {
    // For now, return the same as download URL
    // In the future, this could generate thumbnails or previews
    return this.getDocumentDownloadUrl(document);
  }

  static async logAccess(documentId: string, accessType: 'view' | 'download' | 'edit' | 'delete'): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          access_type: accessType,
          accessed_by: 'current-user', // TODO: Get from auth
          accessed_by_name: 'Current User', // TODO: Get from auth
          ip_address: '', // TODO: Get client IP if needed
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Failed to log document access:', error);
        // Don't throw error to avoid breaking the main functionality
      }
    } catch (error) {
      console.error('Failed to log document access:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  static async getAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    const { data, error } = await supabase
      .from('document_access_logs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(log => ({
      ...log,
      access_type: log.access_type as DocumentAccessLog['access_type']
    }));
  }

  static async getDocumentCategories(): Promise<DocumentCategory[]> {
    return this.getCategories();
  }
}
