
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, DocumentTag, DocumentSearchParams, CreateDocumentData, DocumentAccessLog } from '@/types/document';

export class DocumentService {
  // Document CRUD operations
  static async createDocument(data: CreateDocumentData): Promise<Document> {
    console.log('Creating document:', data);
    
    const { data: result, error } = await supabase
      .from('documents')
      .insert({
        ...data,
        created_by: 'current-user', // TODO: Replace with actual auth user
        created_by_name: 'Current User' // TODO: Replace with actual auth user name
      })
      .select(`
        *,
        category_name:document_categories(name)
      `)
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }

    return result;
  }

  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    console.log('Fetching documents with params:', params);
    
    const { data, error } = await supabase
      .rpc('search_documents', {
        p_search_query: params.search_query || null,
        p_category_id: params.category_id || null,
        p_document_type: params.document_type || null,
        p_tags: params.tags || null,
        p_work_order_id: params.work_order_id || null,
        p_customer_id: params.customer_id || null,
        p_limit: params.limit || 50,
        p_offset: params.offset || 0
      });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    return data || [];
  }

  static async getDocumentById(id: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        category_name:document_categories(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }

    return data;
  }

  static async updateDocument(id: string, updates: Partial<CreateDocumentData>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_by: 'current-user', // TODO: Replace with actual auth user
        updated_by_name: 'Current User' // TODO: Replace with actual auth user name
      })
      .eq('id', id)
      .select(`
        *,
        category_name:document_categories(name)
      `)
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw error;
    }

    return data;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // File upload operations
  static async uploadFile(file: File, folder: string = ''): Promise<string> {
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  static async deleteFile(filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Category operations
  static async getCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  }

  static async createCategory(category: Omit<DocumentCategory, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentCategory> {
    const { data, error } = await supabase
      .from('document_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  }

  // Tag operations
  static async getTags(): Promise<DocumentTag[]> {
    const { data, error } = await supabase
      .from('document_tags')
      .select('*')
      .order('usage_count', { ascending: false });

    if (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }

    return data || [];
  }

  static async createTag(name: string): Promise<DocumentTag> {
    const { data, error } = await supabase
      .from('document_tags')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw error;
    }

    return data;
  }

  // Access logging
  static async logAccess(documentId: string, accessType: 'view' | 'download' | 'edit' | 'delete'): Promise<void> {
    try {
      await supabase.rpc('log_document_access', {
        p_document_id: documentId,
        p_access_type: accessType,
        p_accessed_by: 'current-user', // TODO: Replace with actual auth user
        p_accessed_by_name: 'Current User' // TODO: Replace with actual auth user name
      });
    } catch (error) {
      console.error('Error logging document access:', error);
    }
  }

  static async getAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    const { data, error } = await supabase
      .from('document_access_logs')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching access logs:', error);
      return [];
    }

    return data || [];
  }
}
