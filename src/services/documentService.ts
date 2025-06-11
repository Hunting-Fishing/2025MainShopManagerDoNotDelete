
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentSearchParams, CreateDocumentData, CustomerDocument, DocumentAccessLog } from '@/types/document';

export class DocumentService {
  static async getDocuments(searchParams: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select(`
        *,
        document_categories!category_id (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('is_archived', false);

    if (searchParams.search_query) {
      query = query.or(`title.ilike.%${searchParams.search_query}%,description.ilike.%${searchParams.search_query}%`);
    }

    if (searchParams.category_id) {
      query = query.eq('category_id', searchParams.category_id);
    }

    if (searchParams.document_type) {
      query = query.eq('document_type', searchParams.document_type);
    }

    if (searchParams.work_order_id) {
      query = query.eq('work_order_id', searchParams.work_order_id);
    }

    if (searchParams.customer_id) {
      query = query.eq('customer_id', searchParams.customer_id);
    }

    if (searchParams.tags && searchParams.tags.length > 0) {
      query = query.overlaps('tags', searchParams.tags);
    }

    query = query.order('created_at', { ascending: false });

    if (searchParams.limit) {
      query = query.limit(searchParams.limit);
    }

    if (searchParams.offset) {
      query = query.range(searchParams.offset, searchParams.offset + (searchParams.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(doc => ({
      ...doc,
      category_name: doc.document_categories?.name || null,
      document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
      metadata: typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : (doc.metadata || {}),
      tags: Array.isArray(doc.tags) ? doc.tags : []
    }));
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const insertData = {
      ...documentData,
      metadata: documentData.metadata || {},
      tags: documentData.tags || [],
      is_public: documentData.is_public || false,
      is_archived: false,
    };

    const { data, error } = await supabase
      .from('documents')
      .insert([insertData])
      .select(`
        *,
        document_categories!category_id (
          id,
          name,
          color,
          icon
        )
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      category_name: data.document_categories?.name || null,
      document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
      metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : (data.metadata || {}),
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  }

  static async updateDocument(id: string, updates: Partial<CreateDocumentData>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        document_categories!category_id (
          id,
          name,
          color,
          icon
        )
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      category_name: data.document_categories?.name || null,
      document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
      metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : (data.metadata || {}),
      tags: Array.isArray(data.tags) ? data.tags : []
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

  static async logAccess(
    documentId: string, 
    accessType: 'view' | 'download' | 'edit' | 'delete',
    accessedBy: string,
    accessedByName: string
  ): Promise<DocumentAccessLog> {
    const { data, error } = await supabase
      .from('document_access_logs')
      .insert([{
        document_id: documentId,
        access_type: accessType,
        accessed_by: accessedBy,
        accessed_by_name: accessedByName
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadFile(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }
}

// Export individual functions for backward compatibility
export const getDocuments = DocumentService.getDocuments.bind(DocumentService);
export const createDocument = DocumentService.createDocument.bind(DocumentService);
export const updateDocument = DocumentService.updateDocument.bind(DocumentService);
export const deleteDocument = DocumentService.deleteDocument.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);

// Customer-specific document functions
export async function getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  const documents = await DocumentService.getDocuments({ customer_id: customerId });
  return documents.filter(doc => doc.customer_id) as CustomerDocument[];
}

export async function uploadDocument(file: File, documentData: CreateDocumentData): Promise<Document> {
  // Upload file first
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const path = `uploads/${filename}`;
  
  const fileUrl = await DocumentService.uploadFile(file, path);
  
  // Create document record
  const completeData: CreateDocumentData = {
    ...documentData,
    file_path: path,
    file_url: fileUrl,
    file_size: file.size,
    mime_type: file.type,
  };

  return DocumentService.createDocument(completeData);
}

export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const { data, error } = await supabase
    .from('documents')
    .select('file_path, file_url')
    .eq('id', documentId)
    .single();

  if (error) throw error;
  
  return data.file_url || data.file_path || '';
}

export async function uploadDocumentVersion(
  documentId: string,
  file: File,
  versionNotes?: string
): Promise<void> {
  // This is a simplified version - in a full implementation,
  // you'd want to create a new version record
  const timestamp = Date.now();
  const filename = `${timestamp}_${file.name}`;
  const path = `versions/${filename}`;
  
  const fileUrl = await DocumentService.uploadFile(file, path);
  
  await supabase
    .from('documents')
    .update({
      file_path: path,
      file_url: fileUrl,
      file_size: file.size,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);
}
