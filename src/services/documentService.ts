
import { supabase } from '@/lib/supabase';
import { Document, DocumentCategory, CreateDocumentData, DocumentAccessLog, DocumentVersion } from '@/types/document';

export class DocumentService {
  static async getDocuments(searchParams: any = {}): Promise<Document[]> {
    try {
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
        .eq('is_archived', false);

      if (searchParams.search_query) {
        query = query.textSearch('title', searchParams.search_query);
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

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(doc => ({
        ...doc,
        document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata || {},
        category_name: doc.document_categories?.name || null
      })) || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
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

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...documentData,
          created_by: documentData.created_by || 'system',
          created_by_name: documentData.created_by_name || 'System',
          metadata: documentData.metadata || {}
        }])
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

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata || {},
        category_name: data.document_categories?.name || null
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata || {},
        category_name: data.document_categories?.name || null
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

  static async logAccess(documentId: string, accessType: 'view' | 'download' | 'edit' | 'delete', userId: string, userName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_access_logs')
        .insert([{
          document_id: documentId,
          access_type: accessType,
          accessed_by: userId,
          accessed_by_name: userName
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging document access:', error);
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

      return data?.map(log => ({
        ...log,
        access_type: log.access_type as 'view' | 'download' | 'edit' | 'delete'
      })) || [];
    } catch (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
  }

  static async uploadFile(file: File, path: string): Promise<{ path: string; url: string }> {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(path, file);

      if (error) throw error;

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

  static async searchDocuments(query: string, filters: any = {}): Promise<Document[]> {
    try {
      const result = await supabase.rpc('search_documents', {
        p_search_query: query,
        p_category_id: filters.category_id,
        p_document_type: filters.document_type,
        p_tags: filters.tags,
        p_work_order_id: filters.work_order_id,
        p_customer_id: filters.customer_id,
        p_limit: filters.limit || 50,
        p_offset: filters.offset || 0
      });

      const { data, error } = result;

      if (error) throw error;

      return data?.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        file_url: doc.file_url,
        category_name: doc.category_name,
        tags: doc.tags || [],
        created_by_name: doc.created_by_name,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        created_by: '',
        file_path: '',
        file_size: 0,
        mime_type: '',
        category_id: '',
        work_order_id: '',
        customer_id: '',
        is_public: false,
        is_archived: false,
        metadata: {},
        updated_by: '',
        updated_by_name: ''
      })) || [];
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  }
}

// Named exports for backward compatibility
export const getCustomerDocuments = async (customerId: string): Promise<Document[]> => {
  return DocumentService.getDocuments({ customer_id: customerId });
};

export const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  return DocumentService.getCategories();
};

export const uploadDocument = async (file: File, documentData: CreateDocumentData): Promise<Document> => {
  try {
    // Upload file first
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `documents/${fileName}`;
    
    const uploadResult = await DocumentService.uploadFile(file, filePath);
    
    // Create document record
    const docData: CreateDocumentData = {
      ...documentData,
      file_path: uploadResult.path,
      file_url: uploadResult.url,
      file_size: file.size,
      mime_type: file.type,
      created_by: documentData.created_by || 'system',
      created_by_name: documentData.created_by_name || 'System'
    };
    
    return DocumentService.createDocument(docData);
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const deleteDocument = async (id: string): Promise<void> => {
  return DocumentService.deleteDocument(id);
};

export const getDocumentDownloadUrl = async (document: Document): Promise<string> => {
  if (document.file_url) {
    return document.file_url;
  }
  throw new Error('Document has no file URL');
};

export const uploadDocumentVersion = async (documentId: string, file: File, versionNotes?: string): Promise<DocumentVersion> => {
  try {
    // This is a simplified version - in a real implementation you'd upload to storage first
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `document-versions/${fileName}`;
    
    const uploadResult = await DocumentService.uploadFile(file, filePath);
    
    // Insert new version record
    const { data, error } = await supabase
      .from('document_versions')
      .insert([{
        document_id: documentId,
        file_path: uploadResult.path,
        file_size: file.size,
        version_notes: versionNotes,
        created_by: 'system',
        created_by_name: 'System'
      }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading document version:', error);
    throw error;
  }
};

export default DocumentService;
