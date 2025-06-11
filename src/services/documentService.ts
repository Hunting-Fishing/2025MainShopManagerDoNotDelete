import { supabase } from '@/integrations/supabase/client';
import { 
  Document, 
  CustomerDocument, 
  DocumentCategory, 
  DocumentVersion, 
  DocumentAccessLog, 
  CreateDocumentData,
  DocumentSearchParams 
} from '@/types/document';

export class DocumentService {
  static async uploadFile(file: File): Promise<{ path: string; url: string }> {
    const filePath = `documents/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("File upload error:", error);
      throw error;
    }

    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/documents/${filePath}`;
    
    return { path: filePath, url };
  }

  static async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link'
    } as Document;
  }

  static async getDocuments(searchParams: DocumentSearchParams = {}): Promise<Document[]> {
    let query = supabase
      .from('documents')
      .select(`
        *,
        document_categories!documents_category_id_fkey(name)
      `);

    // Apply filters based on search params
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

    if (searchParams.limit) {
      query = query.limit(searchParams.limit);
    }

    if (searchParams.offset) {
      query = query.range(searchParams.offset, searchParams.offset + (searchParams.limit || 10) - 1);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    return (data || []).map(doc => ({
      ...doc,
      document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
      category_name: doc.document_categories?.name
    })) as Document[];
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
    } as Document;
  }

  static async deleteDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async getCustomerDocuments(customerId: string): Promise<CustomerDocument[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customerId);
    
    if (error) throw error;
    
    return (data || []).map(doc => ({
      ...doc,
      document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link'
    })) as CustomerDocument[];
  }

  static async getDocumentCategories(): Promise<DocumentCategory[]> {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  static async uploadDocument(
    file: File, 
    documentData: Omit<CreateDocumentData, 'file_path' | 'file_size' | 'mime_type'>,
    customerId?: string,
    workOrderId?: string
  ): Promise<Document> {
    // Upload file first
    const uploadResult = await this.uploadFile(file);
    
    // Create document record
    const completeDocumentData: CreateDocumentData = {
      ...documentData,
      file_path: uploadResult.path,
      file_size: file.size,
      mime_type: file.type,
      customer_id: customerId,
      work_order_id: workOrderId
    };
    
    return this.createDocument(completeDocumentData);
  }

  static async getDocumentDownloadUrl(document: Document): Promise<string> {
    if (!document.file_path) {
      throw new Error('Document has no file path');
    }
    
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(document.file_path, 3600); // 1 hour expiry
    
    if (error) throw error;
    return data.signedUrl;
  }

  static async uploadDocumentVersion(
    documentId: string,
    file: File,
    versionNotes?: string
  ): Promise<DocumentVersion> {
    // Upload the new file version
    const uploadResult = await this.uploadFile(file);
    
    // Get the current version number
    const { data: versions, error: versionError } = await supabase
      .from('document_versions')
      .select('version_number')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false })
      .limit(1);
    
    if (versionError) throw versionError;
    
    const currentVersion = versions && versions.length > 0 ? versions[0].version_number : 0;
    const newVersionNumber = currentVersion + 1;
    
    // Create the document version record
    const { data, error } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: newVersionNumber,
        file_path: uploadResult.path,
        file_size: file.size,
        version_notes: versionNotes,
        created_by: 'current_user_id', // Replace with actual user ID
        created_by_name: 'Current User' // Replace with actual user name
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as DocumentVersion;
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
        accessed_by: accessedBy,
        accessed_by_name: accessedByName,
        access_type: accessType,
        ip_address: ipAddress,
        user_agent: userAgent
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as DocumentAccessLog;
  }
}

// Export individual functions for backward compatibility
export const getCustomerDocuments = DocumentService.getCustomerDocuments.bind(DocumentService);
export const getDocumentCategories = DocumentService.getDocumentCategories.bind(DocumentService);
export const uploadDocument = DocumentService.uploadDocument.bind(DocumentService);
export const deleteDocument = DocumentService.deleteDocument.bind(DocumentService);
export const getDocumentDownloadUrl = DocumentService.getDocumentDownloadUrl.bind(DocumentService);
export const uploadDocumentVersion = DocumentService.uploadDocumentVersion.bind(DocumentService);
