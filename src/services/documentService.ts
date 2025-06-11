
import { supabase } from '@/lib/supabase';
import { Document, DocumentCategory, DocumentSearchParams, CreateDocumentData, DocumentAccessLog, CustomerDocument } from '@/types/document';

class DocumentServiceClass {
  async getDocuments(searchParams: DocumentSearchParams = {}): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(name)
        `);

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

      if (searchParams.tags && searchParams.tags.length > 0) {
        query = query.overlaps('tags', searchParams.tags);
      }

      query = query.eq('is_archived', false);

      const { data, error } = await query;

      if (error) throw error;

      return data.map(item => ({
        ...item,
        document_type: item.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: item.category?.name || null
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getDocument(id: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.category?.name || null
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  async getCategories(): Promise<DocumentCategory[]> {
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

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([documentData])
        .select(`
          *,
          category:document_categories(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.category?.name || null
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:document_categories(name)
        `)
        .single();

      if (error) throw error;

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.category?.name || null
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string): Promise<void> {
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

  async uploadFile(file: File, bucket: string = 'documents'): Promise<{ path: string; url: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        path: data.path,
        url: publicUrl
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  async logAccess(documentId: string, accessType: 'view' | 'download' | 'edit' | 'delete', accessedBy: string, accessedByName: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('document_access_logs')
        .insert([{
          document_id: documentId,
          access_type: accessType,
          accessed_by: accessedBy,
          accessed_by_name: accessedByName
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging access:', error);
      throw error;
    }
  }

  async getDocumentAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
    try {
      const { data, error } = await supabase
        .from('document_access_logs')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        ...item,
        access_type: item.access_type as 'view' | 'download' | 'edit' | 'delete'
      }));
    } catch (error) {
      console.error('Error fetching access logs:', error);
      throw error;
    }
  }
}

export const DocumentService = new DocumentServiceClass();

// Helper functions for customer documents
export async function getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
  const documents = await DocumentService.getDocuments({ customer_id: customerId });
  return documents.filter(doc => doc.customer_id === customerId) as CustomerDocument[];
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  return DocumentService.getCategories();
}

export async function deleteDocument(id: string): Promise<void> {
  return DocumentService.deleteDocument(id);
}
