import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, CreateDocumentData, CustomerDocument, DocumentAccessLog } from '@/types/document';

export class DocumentService {
  static async getDocuments(searchParams?: any): Promise<Document[]> {
    let query = supabase.from('documents').select(`
      *,
      document_categories!documents_category_id_fkey(name)
    `);

    if (searchParams?.search_query) {
      query = query.ilike('title', `%${searchParams.search_query}%`);
    }

    if (searchParams?.category_id) {
      query = query.eq('category_id', searchParams.category_id);
    }

    if (searchParams?.document_type) {
      query = query.eq('document_type', searchParams.document_type);
    }

    if (searchParams?.customer_id) {
      query = query.eq('customer_id', searchParams.customer_id);
    }

    if (searchParams?.work_order_id) {
      query = query.eq('work_order_id', searchParams.work_order_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(doc => ({
      ...doc,
      category_name: doc.document_categories?.name
    })) as Document[];
  }

  static async getCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: documentData.title,
        description: documentData.description,
        document_type: documentData.document_type,
        file_path: documentData.file_path,
        file_url: documentData.file_url,
        file_size: documentData.file_size,
        mime_type: documentData.mime_type,
        category_id: documentData.category_id,
        work_order_id: documentData.work_order_id,
        customer_id: documentData.customer_id,
        is_public: documentData.is_public || false,
        metadata: documentData.metadata || {},
        tags: documentData.tags || [],
        created_by: documentData.created_by,
        created_by_name: documentData.created_by_name
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadFile(file: File): Promise<{ path: string; url: string }> {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  }

  static async bulkCreateDocuments(documents: CreateDocumentData[]): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .insert(documents)
      .select();

    if (error) throw error;
    return data || [];
  }

  static async logAccess(
    documentId: string, 
    accessType: 'view' | 'download' | 'edit' | 'delete',
    userId: string,
    userName: string
  ): Promise<void> {
    const accessLog: Omit<DocumentAccessLog, 'id'> = {
      document_id: documentId,
      access_type: accessType,
      accessed_by: userId,
      accessed_by_name: userName,
      created_at: new Date().toISOString(),
      ip_address: '',
      user_agent: navigator.userAgent || ''
    };

    const { error } = await supabase
      .from('document_access_logs')
      .insert(accessLog);

    if (error) {
      console.error('Error logging document access:', error);
    }
  }
}

// Export individual functions for backward compatibility
export const getDocuments = DocumentService.getDocuments.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);
export const createDocument = DocumentService.createDocument.bind(DocumentService);
export const uploadFile = DocumentService.uploadFile.bind(DocumentService);
export const bulkCreateDocuments = DocumentService.bulkCreateDocuments.bind(DocumentService);
export const logAccess = DocumentService.logAccess.bind(DocumentService);

// Customer-specific document functions
export async function getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  const documents = await getDocuments({ customer_id: customerId });
  return documents.filter(doc => doc.customer_id === customerId) as CustomerDocument[];
}

export async function uploadDocument(
  customerId: string,
  file: File,
  title: string,
  description?: string,
  categoryId?: string,
  tags: string[] = []
): Promise<CustomerDocument> {
  const uploadResult = await uploadFile(file);
  
  const documentData: CreateDocumentData = {
    title,
    description,
    document_type: file.type.startsWith('image/') ? 'image' : 'pdf',
    file_path: uploadResult.path,
    file_url: uploadResult.url,
    file_size: file.size,
    mime_type: file.type,
    category_id: categoryId,
    customer_id: customerId,
    is_public: false,
    tags,
    created_by: 'current_user_id',
    created_by_name: 'Current User'
  };

  const document = await createDocument(documentData);
  return document as CustomerDocument;
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error deleting document:', error);
    return false;
  }

  return true;
}

export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const { data: document } = await supabase
    .from('documents')
    .select('file_path, file_url')
    .eq('id', documentId)
    .single();

  if (!document) {
    throw new Error('Document not found');
  }

  return document.file_url || document.file_path || '';
}

export async function uploadDocumentVersion(
  documentId: string,
  file: File,
  versionNotes?: string
): Promise<void> {
  const uploadResult = await uploadFile(file);
  
  // For now, just create a new document version record
  // In a real implementation, you might have a document_versions table
  const { error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      file_path: uploadResult.path,
      file_size: file.size,
      version_notes: versionNotes,
      created_by: 'current_user_id',
      created_by_name: 'Current User',
      version_number: 1 // This should be calculated based on existing versions
    });

  if (error) {
    console.error('Error creating document version:', error);
    throw error;
  }
}

export default DocumentService;
