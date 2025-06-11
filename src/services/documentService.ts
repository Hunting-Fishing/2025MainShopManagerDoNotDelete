
import { supabase } from "@/lib/supabase";
import { Document, DocumentCategory, DocumentSearchParams, CreateDocumentData, DocumentAccessLog } from "@/types/document";

export const DocumentService = {
  async getDocuments(searchParams: DocumentSearchParams = {}): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(id, name, color)
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

      if (searchParams.work_order_id) {
        query = query.eq('work_order_id', searchParams.work_order_id);
      }

      if (searchParams.customer_id) {
        query = query.eq('customer_id', searchParams.customer_id);
      }

      if (searchParams.limit) {
        query = query.limit(searchParams.limit);
      }

      if (searchParams.offset) {
        query = query.range(searchParams.offset, searchParams.offset + (searchParams.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(doc => ({
        ...doc,
        document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: doc.category?.name
      })) || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw new Error('Failed to fetch documents');
    }
  },

  async getDocument(id: string): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          category:document_categories(id, name, color)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Document not found');

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.category?.name
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  },

  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select(`
          *,
          category:document_categories(id, name, color)
        `)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create document');

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.category?.name
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  },

  async updateDocument(id: string, updates: Partial<CreateDocumentData>): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          category:document_categories(id, name, color)
        `)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Document not found');

      return {
        ...data,
        document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
        category_name: data.category?.name
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  },

  async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  },

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
      throw new Error('Failed to upload file');
    }
  },

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
      throw new Error('Failed to fetch categories');
    }
  },

  async logAccess(documentId: string, accessType: 'view' | 'download' | 'edit' | 'delete'): Promise<void> {
    try {
      // Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('document_access_logs')
        .insert({
          document_id: documentId,
          accessed_by: user.id,
          accessed_by_name: user.email || 'Unknown User',
          access_type: accessType,
          ip_address: null, // Could be populated from request headers
          user_agent: navigator.userAgent
        });

      if (error) {
        console.error('Error logging document access:', error);
      }
    } catch (error) {
      console.error('Error logging document access:', error);
    }
  },

  async getDocumentAccessLogs(documentId: string): Promise<DocumentAccessLog[]> {
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
      console.error('Error fetching document access logs:', error);
      throw new Error('Failed to fetch document access logs');
    }
  },

  async uploadDocumentVersion(documentId: string, file: File, versionNotes?: string): Promise<Document> {
    try {
      // Upload the new file
      const uploadResult = await this.uploadFile(file, 'documents');
      
      // Update the document with new file information
      const updates = {
        file_path: uploadResult.path,
        file_url: uploadResult.url,
        file_size: file.size,
        mime_type: file.type,
        updated_at: new Date().toISOString()
      };

      return await this.updateDocument(documentId, updates);
    } catch (error) {
      console.error('Error uploading document version:', error);
      throw new Error('Failed to upload document version');
    }
  }
};

// Legacy exports for backward compatibility
export const getCustomerDocuments = async (customerId: string) => {
  return DocumentService.getDocuments({ customer_id: customerId });
};

export const getDocumentCategories = async () => {
  return DocumentService.getCategories();
};

export const deleteDocument = async (id: string) => {
  return DocumentService.deleteDocument(id);
};

export const uploadDocumentVersion = async (documentId: string, file: File, versionNotes?: string) => {
  return DocumentService.uploadDocumentVersion(documentId, file, versionNotes);
};
