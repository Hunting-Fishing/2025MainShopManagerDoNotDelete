import { supabase } from '@/lib/supabase';
import { Document, DocumentCategory, DocumentTag, DocumentVersion, DocumentAccessLog, DocumentSearchParams, CreateDocumentData } from '@/types/document';
import { v4 as uuidv4 } from 'uuid';

export class DocumentService {
  static async getDocuments(params: DocumentSearchParams = {}): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_archived', false)
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
        query = query.range(params.offset, (params.offset || 0) + (params.limit || 9) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocuments:', error);
      throw error;
    }
  }

  static async getDocumentById(id: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching document by ID:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getDocumentById:', error);
      throw error;
    }
  }

  static async getCustomerDocuments(customerId: string): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('customer_id', customerId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer documents:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCustomerDocuments:', error);
      throw error;
    }
  }

  static async getCategories(): Promise<DocumentCategory[]> {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching document categories:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCategories:', error);
      throw error;
    }
  }

  static async createDocument(data: CreateDocumentData): Promise<Document> {
    try {
      const { data: newDocument, error } = await supabase
        .from('documents')
        .insert([
          {
            ...data,
            id: uuidv4(), // Generate a UUID for the new document
          },
        ])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }

      return newDocument as Document;
    } catch (error) {
      console.error('Error in createDocument:', error);
      throw error;
    }
  }

  static async updateDocument(id: string, updates: Partial<Document>): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in updateDocument:', error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      throw error;
    }
  }

  static async uploadFile(file: File, folder: string): Promise<{ path: string; url: string }> {
    try {
      const filePath = `${folder}/${uuidv4()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data.Key}`;

      return { path: data.Key, url };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      throw error;
    }
  }

  static async uploadDocumentVersion(documentId: string, file: File, versionNotes?: string): Promise<DocumentVersion> {
    try {
      const filePath = `document_versions/${documentId}/${uuidv4()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      // Fetch the current max version number for the document
      const { data: versions, error: versionsError } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1);

      if (versionsError) {
        console.error('Error fetching existing versions:', versionsError);
        throw versionsError;
      }

      const currentVersionNumber = versions && versions.length > 0 ? versions[0].version_number : 0;
      const newVersionNumber = currentVersionNumber + 1;

      const { data: versionData, error: versionError } = await supabase
        .from('document_versions')
        .insert([
          {
            document_id: documentId,
            version_number: newVersionNumber,
            file_path: uploadData.Key,
            file_size: file.size,
            version_notes: versionNotes,
            created_by: 'current_user_id', // Replace with actual user ID
            created_by_name: 'Current User', // Replace with actual user name
          },
        ])
        .select('*')
        .single();

      if (versionError) {
        console.error('Error creating document version:', versionError);
        throw versionError;
      }

      return versionData as DocumentVersion;
    } catch (error) {
      console.error('Error in uploadDocumentVersion:', error);
      throw error;
    }
  }

  static async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching document versions:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDocumentVersions:', error);
      throw error;
    }
  }

  static async logAccess(documentId: string, accessType: string, accessedBy: string, accessedByName: string, ipAddress?: string, userAgent?: string): Promise<DocumentAccessLog> {
    try {
      const { data, error } = await supabase
        .from('document_access_logs')
        .insert([
          {
            document_id: documentId,
            accessed_by: accessedBy,
            accessed_by_name: accessedByName,
            access_type: accessType,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        ])
        .select('*')
        .single();

      if (error) {
        console.error('Error logging document access:', error);
        throw error;
      }

      return data as DocumentAccessLog;
    } catch (error) {
      console.error('Error in logAccess:', error);
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

      if (error) {
        console.error('Error fetching document access logs:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAccessLogs:', error);
      throw error;
    }
  }
}

// Legacy function exports for backward compatibility
export const getDocuments = DocumentService.getDocuments.bind(DocumentService);
export const getDocumentById = DocumentService.getDocumentById.bind(DocumentService);
export const getCustomerDocuments = DocumentService.getCustomerDocuments.bind(DocumentService);
export const getDocumentCategories = DocumentService.getCategories.bind(DocumentService);
export const createDocument = DocumentService.createDocument.bind(DocumentService);
export const updateDocument = DocumentService.updateDocument.bind(DocumentService);
export const deleteDocument = DocumentService.deleteDocument.bind(DocumentService);
export const uploadFile = DocumentService.uploadFile.bind(DocumentService);
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion.bind(DocumentService);
export const getDocumentVersions = DocumentService.getDocumentVersions.bind(DocumentService);
export const logAccess = DocumentService.logAccess.bind(DocumentService);
export const getAccessLogs = DocumentService.getAccessLogs.bind(DocumentService);
