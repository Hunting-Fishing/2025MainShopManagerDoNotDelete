import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, CreateDocumentData, DocumentSearchParams } from '@/types/document';

export class DocumentService {
  static async getDocuments(searchParams: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select(`
        *,
        category:document_categories(name)
      `)
      .order('created_at', { ascending: false });

    if (searchParams.search_query) {
      query = query.or(`title.ilike.%${searchParams.search_query}%,description.ilike.%${searchParams.search_query}%`);
    }

    if (searchParams.category_id) {
      query = query.eq('category_id', searchParams.category_id);
    }

    if (searchParams.document_type) {
      query = query.eq('document_type', searchParams.document_type);
    }

    if (searchParams.customer_id) {
      query = query.eq('customer_id', searchParams.customer_id);
    }

    if (searchParams.work_order_id) {
      query = query.eq('work_order_id', searchParams.work_order_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  static async getDocument(id: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async uploadDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDocument(id: string, updates: Partial<CreateDocumentData>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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

  static async logAccess(documentId: string, accessType: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { error } = await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          accessed_by: user.id,
          access_type: accessType
        });

      if (error) {
        console.error('Error logging document access:', error);
      }
    }
  }

  static async uploadDocumentVersion(documentId: string, file: File, versionNotes?: string): Promise<any> {
    // This is a placeholder implementation
    // In a real implementation, you would upload the file and create a version record
    console.log('Upload document version:', { documentId, file, versionNotes });
    return { success: true };
  }
}

export const getCustomerDocuments = DocumentService.getDocuments;
export const getDocumentCategories = DocumentService.getCategories;
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion;
