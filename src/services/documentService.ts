
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentVersion, DocumentAccessLog, DocumentSearchParams, CreateDocumentData, CustomerDocument } from '@/types/document';

// Export the DocumentService class and individual functions
export class DocumentService {
  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*, category:document_categories(name)')
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

    if (params.limit) {
      query = query.limit(params.limit);
    }

    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(doc => ({
      ...doc,
      category_name: doc.category?.name
    })) || [];
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select('*, category:document_categories(name)')
      .single();

    if (error) throw error;

    return {
      ...data,
      category_name: data.category?.name
    };
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select('*, category:document_categories(name)')
      .single();

    if (error) throw error;

    return {
      ...data,
      category_name: data.category?.name
    };
  }

  static async deleteDocument(id: string): Promise<void> {
    // First get the document to find the file path
    const { data: document } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .single();

    // Delete the file from storage if it exists
    if (document?.file_path) {
      try {
        const { data: files } = await supabase.storage
          .from('documents')
          .list('', { search: document.file_path });

        if (files && files.length > 0) {
          await supabase.storage
            .from('documents')
            .remove([document.file_path]);
        }
      } catch (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
      }
    }

    // Delete the document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async uploadFile(file: File, folder = 'general'): Promise<{ path: string; url: string }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: urlData.publicUrl
    };
  }

  static async getDocumentDownloadUrl(filePath: string): Promise<string> {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  static async uploadDocumentVersion(
    documentId: string,
    file: File,
    versionNotes?: string
  ): Promise<DocumentVersion> {
    // Get current document to determine folder structure
    const { data: document } = await supabase
      .from('documents')
      .select('title, file_path')
      .eq('id', documentId)
      .single();

    if (!document) throw new Error('Document not found');

    // Upload new version
    const { path: newFilePath, url: newFileUrl } = await this.uploadFile(file, 'versions');

    // Get current version number
    const { data: versions } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    const nextVersion = (versions?.[0]?.version_number || 0) + 1;

    // Create version record
    const { data: version, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersion,
        file_path: newFilePath,
        file_size: file.size,
        version_notes: versionNotes,
        created_by: 'current_user_id', // This should come from auth context
        created_by_name: 'Current User' // This should come from auth context
      })
      .select()
      .single();

    if (error) throw error;

    // Update main document to point to new version
    await supabase
      .from('documents')
      .update({
        file_path: newFilePath,
        file_url: newFileUrl,
        file_size: file.size,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    return version;
  }

  static async logAccess(
    documentId: string,
    accessType: 'view' | 'download' | 'edit' | 'delete',
    accessedBy: string,
    accessedByName: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<DocumentAccessLog> {
    const { data, error } = await supabase
      .from('document_access_logs')
      .insert({
        document_id: documentId,
        access_type: accessType,
        accessed_by: accessedBy,
        accessed_by_name: accessedByName,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Export individual functions for backward compatibility
export const getDocuments = DocumentService.getDocuments.bind(DocumentService);
export const createDocument = DocumentService.createDocument.bind(DocumentService);
export const updateDocument = DocumentService.updateDocument.bind(DocumentService);
export const deleteDocument = DocumentService.deleteDocument.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);
export const uploadDocument = DocumentService.uploadFile.bind(DocumentService);
export const getDocumentDownloadUrl = DocumentService.getDocumentDownloadUrl.bind(DocumentService);
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion.bind(DocumentService);

// Customer-specific document functions
export async function getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  const documents = await DocumentService.getDocuments({ customer_id: customerId });
  return documents.map(doc => ({ ...doc, customer_id: customerId }));
}
