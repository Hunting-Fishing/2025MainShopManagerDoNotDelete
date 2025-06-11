import { supabase } from "@/lib/supabase";
import { Document, DocumentCategory, CustomerDocument, DocumentVersion, DocumentAccessLog, DocumentSearchParams } from "@/types/document";
import { v4 as uuidv4 } from 'uuid';

const getCustomerDocuments = async (customerId: string): Promise<CustomerDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customerId);

    if (error) {
      console.error("Error fetching customer documents:", error);
      return [];
    }

    return data as CustomerDocument[];
  } catch (error) {
    console.error("Error fetching customer documents:", error);
    return [];
  }
};

const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*');

    if (error) {
      console.error("Error fetching document categories:", error);
      return [];
    }

    return data as DocumentCategory[];
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return [];
  }
};

const uploadDocumentVersion = async (
  documentId: string,
  file: File,
  versionNotes?: string
): Promise<DocumentVersion | null> => {
  try {
    // Upload file to storage
    const filePath = `documents/${documentId}/versions/${uuidv4()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get file size
    const { data: fileSizeData, error: fileSizeError } = await supabase.storage
      .from('public')
      .getMetadata(filePath);

    if (fileSizeError) {
      console.error("Error getting file metadata:", fileSizeError);
    }

    const fileSize = fileSizeData?.size || 0;

    // Create new document version record
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert([
        {
          document_id: documentId,
          file_path: filePath,
          file_size: fileSize,
          version_notes: versionNotes,
          created_by: 'current_user_id', // Replace with actual user ID
          created_by_name: 'Current User' // Replace with actual user name
        }
      ])
      .select()
      .single();

    if (versionError) {
      console.error("Error creating document version:", versionError);
      throw versionError;
    }

    return versionData as DocumentVersion;
  } catch (error) {
    console.error("Error uploading document version:", error);
    return null;
  }
};

const getDocumentDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data } = await supabase.storage
      .from('public')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error getting download URL:", error);
    return null;
  }
};

const uploadDocument = async (
  file: File,
  documentData: Omit<Document, 'id' | 'created_at' | 'updated_at'>
): Promise<Document | null> => {
  try {
    // Generate unique file path
    const filePath = `documents/${uuidv4()}-${file.name}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('public')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      throw uploadError;
    }

    // Get file size
    const { data: fileSizeData, error: fileSizeError } = await supabase.storage
      .from('public')
      .getMetadata(filePath);

    if (fileSizeError) {
      console.error("Error getting file metadata:", fileSizeError);
    }

    const fileSize = fileSizeData?.size || 0;

    // Create document record in database
    const { data: documentDataResult, error: documentError } = await supabase
      .from('documents')
      .insert([
        {
          ...documentData,
          file_path: filePath,
          file_size: fileSize,
        }
      ])
      .select()
      .single();

    if (documentError) {
      console.error("Error creating document:", documentError);
      throw documentError;
    }

    return documentDataResult as Document;
  } catch (error) {
    console.error("Error uploading document:", error);
    return null;
  }
};

const deleteDocument = async (documentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

const getDocuments = async (params: DocumentSearchParams): Promise<Document[]> => {
  try {
    let query = supabase
      .from('documents')
      .select('*');

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
      query = query.range(params.offset, (params.offset + params.limit) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching documents:", error);
      return [];
    }

    return data as Document[];
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
};

const createDocument = async (documentData: any): Promise<Document | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error("Error creating document:", error);
      throw error;
    }

    return data as Document;
  } catch (error) {
    console.error("Error creating document:", error);
    return null;
  }
};

const updateDocument = async (id: string, updates: any): Promise<Document | null> => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating document:", error);
      throw error;
    }

    return data as Document;
  } catch (error) {
    console.error("Error updating document:", error);
    return null;
  }
};

const logAccess = async (
  documentId: string,
  accessType: 'view' | 'download' | 'edit' | 'delete',
  accessedBy: string,
  accessedByName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<DocumentAccessLog | null> => {
  try {
    const { data, error } = await supabase
      .from('document_access_logs')
      .insert([
        {
          document_id: documentId,
          access_type: accessType,
          accessed_by: accessedBy,
          accessed_by_name: accessedByName,
          ip_address: ipAddress,
          user_agent: userAgent,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error logging document access:", error);
      return null;
    }

    return data as DocumentAccessLog;
  } catch (error) {
    console.error("Error logging document access:", error);
    return null;
  }
};

export {
  getCustomerDocuments,
  getDocumentCategories,
  uploadDocumentVersion,
  getDocumentDownloadUrl,
  uploadDocument,
  deleteDocument,
  getDocuments,
  createDocument,
  updateDocument,
  logAccess
};
