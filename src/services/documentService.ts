
import { supabase } from '@/lib/supabase';
import { Document, DocumentCategory, CustomerDocument, CreateDocumentData, DocumentSearchParams, DocumentVersion, DocumentAccessLog } from '@/types/document';

export class DocumentService {
  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select('*');

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
      query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(doc => ({
      ...doc,
      document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link'
    }));
  }

  static async getDocument(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data ? {
      ...data,
      document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link'
    } : null;
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link'
    };
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link'
    };
  }

  static async deleteDocument(id: string): Promise<void> {
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

  static async uploadDocument(
    file: File,
    documentData: Omit<CreateDocumentData, 'file_path' | 'file_size' | 'mime_type'>
  ): Promise<Document> {
    // Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Create document record
    const fullDocumentData: CreateDocumentData = {
      ...documentData,
      file_path: uploadData.path,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type
    };

    return this.createDocument(fullDocumentData);
  }

  static async uploadDocumentVersion(
    documentId: string,
    file: File,
    versionNotes?: string
  ): Promise<DocumentVersion> {
    // Upload new version file
    const fileName = `${documentId}-v${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get current version count
    const { data: versions, error: versionsError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionsError) throw versionsError;

    const nextVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 2;

    // Create version record
    const { data, error } = await supabase
      .from('document_versions')
      .insert([{
        document_id: documentId,
        version_number: nextVersion,
        file_path: uploadData.path,
        file_size: file.size,
        version_notes,
        created_by: 'current_user_id', // Replace with actual user ID
        created_by_name: 'Current User' // Replace with actual user name
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getDocumentDownloadUrl(documentId: string): Promise<string> {
    const document = await this.getDocument(documentId);
    if (!document || !document.file_path) {
      throw new Error('Document or file path not found');
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }

  static async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async logAccess(
    documentId: string,
    accessType: 'view' | 'download' | 'edit' | 'delete',
    userId: string,
    userName: string
  ): Promise<void> {
    const { error } = await supabase
      .from('document_access_logs')
      .insert([{
        document_id: documentId,
        access_type: accessType,
        accessed_by: userId,
        accessed_by_name: userName,
        ip_address: '', // Could be populated from request
        user_agent: navigator.userAgent
      }]);

    if (error) throw error;
  }
}

// Legacy functions for backward compatibility
export const getDocuments = DocumentService.getDocuments.bind(DocumentService);
export const getDocument = DocumentService.getDocument.bind(DocumentService);
export const createDocument = DocumentService.createDocument.bind(DocumentService);
export const updateDocument = DocumentService.updateDocument.bind(DocumentService);
export const deleteDocument = DocumentService.deleteDocument.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);
export const uploadDocument = DocumentService.uploadDocument.bind(DocumentService);
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion.bind(DocumentService);
export const getDocumentDownloadUrl = DocumentService.getDocumentDownloadUrl.bind(DocumentService);
export const getDocumentVersions = DocumentService.getDocumentVersions.bind(DocumentService);

export const getCustomerDocuments = async (customerId: string): Promise<CustomerDocument[]> => {
  const documents = await DocumentService.getDocuments({ customer_id: customerId });
  return documents.map(doc => ({ ...doc, customer_id: customerId }));
};
