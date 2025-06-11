
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentCategory, CreateDocumentData, DocumentSearchParams, DocumentAccessLog, DocumentVersion } from '@/types/document';

// Get all documents with optional search parameters
export const getDocuments = async (searchParams: DocumentSearchParams = {}): Promise<Document[]> => {
  let query = supabase
    .from('documents')
    .select(`
      *,
      category:document_categories(id, name, color)
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

  const limit = searchParams.limit || 50;
  const offset = searchParams.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(doc => ({
    ...doc,
    document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
    category_name: doc.category?.name
  })) as Document[];
};

// Get a single document by ID
export const getDocument = async (id: string): Promise<Document | null> => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      category:document_categories(id, name, color)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    ...data,
    document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
    category_name: data.category?.name
  } as Document;
};

// Get documents for a specific customer
export const getCustomerDocuments = async (customerId: string): Promise<Document[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      category:document_categories(id, name, color)
    `)
    .eq('customer_id', customerId)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(doc => ({
    ...doc,
    document_type: doc.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
    category_name: doc.category?.name
  })) as Document[];
};

// Upload a file and create document record
export const uploadFile = async (file: File, documentData: Partial<CreateDocumentData>): Promise<Document> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `documents/${fileName}`;

  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  // Determine document type based on file type
  let documentType: 'pdf' | 'image' | 'weblink' | 'internal_link' = 'pdf';
  if (file.type.startsWith('image/')) {
    documentType = 'image';
  }

  // Create document record
  const { data, error } = await supabase
    .from('documents')
    .insert({
      title: documentData.title || file.name,
      description: documentData.description,
      document_type: documentType,
      file_path: filePath,
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      category_id: documentData.category_id,
      work_order_id: documentData.work_order_id,
      customer_id: documentData.customer_id,
      is_public: documentData.is_public || false,
      metadata: documentData.metadata || {},
      tags: documentData.tags || [],
      created_by: documentData.created_by!,
      created_by_name: documentData.created_by_name!,
    })
    .select(`
      *,
      category:document_categories(id, name, color)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
    category_name: data.category?.name
  } as Document;
};

// Create a document (for links, etc.)
export const createDocument = async (documentData: CreateDocumentData): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select(`
      *,
      category:document_categories(id, name, color)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
    category_name: data.category?.name
  } as Document;
};

// Update a document
export const updateDocument = async (id: string, updates: Partial<Document>): Promise<Document> => {
  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: updates.updated_by,
      updated_by_name: updates.updated_by_name,
    })
    .eq('id', id)
    .select(`
      *,
      category:document_categories(id, name, color)
    `)
    .single();

  if (error) throw error;

  return {
    ...data,
    document_type: data.document_type as 'pdf' | 'image' | 'weblink' | 'internal_link',
    category_name: data.category?.name
  } as Document;
};

// Delete a document
export const deleteDocument = async (id: string): Promise<void> => {
  // First get the document to check if it has a file
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Delete file from storage if it exists
  if (document.file_path) {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);
    
    if (storageError) {
      console.warn('Failed to delete file from storage:', storageError);
    }
  }

  // Delete document record
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Download a document
export const downloadDocument = async (id: string): Promise<Blob> => {
  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  if (!document.file_path) {
    throw new Error('Document has no file to download');
  }

  const { data, error } = await supabase.storage
    .from('documents')
    .download(document.file_path);

  if (error) throw error;

  return data;
};

// Upload a new version of a document
export const uploadDocumentVersion = async (
  documentId: string, 
  file: File, 
  versionNotes?: string
): Promise<DocumentVersion> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `documents/versions/${fileName}`;

  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get current version number
  const { data: versions, error: versionsError } = await supabase
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1);

  if (versionsError) throw versionsError;

  const nextVersion = versions.length > 0 ? versions[0].version_number + 1 : 2;

  // Create version record
  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: nextVersion,
      file_path: filePath,
      file_size: file.size,
      version_notes: versionNotes,
      created_by: '', // This should come from auth context
      created_by_name: '', // This should come from auth context
    })
    .select()
    .single();

  if (error) throw error;

  return data as DocumentVersion;
};

// Get document categories
export const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  const { data, error } = await supabase
    .from('document_categories')
    .select('*')
    .order('name');

  if (error) throw error;

  return data;
};

// Create document category
export const createDocumentCategory = async (category: Omit<DocumentCategory, 'id' | 'created_at' | 'updated_at'>): Promise<DocumentCategory> => {
  const { data, error } = await supabase
    .from('document_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Log document access
export const logDocumentAccess = async (
  documentId: string,
  accessType: 'view' | 'download' | 'edit' | 'delete',
  accessedBy: string,
  accessedByName: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  const { error } = await supabase
    .from('document_access_logs')
    .insert({
      document_id: documentId,
      access_type: accessType,
      accessed_by: accessedBy,
      accessed_by_name: accessedByName,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

  if (error) throw error;
};

// Get document access logs
export const getDocumentAccessLogs = async (documentId: string): Promise<DocumentAccessLog[]> => {
  const { data, error } = await supabase
    .from('document_access_logs')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(log => ({
    ...log,
    access_type: log.access_type as 'view' | 'download' | 'edit' | 'delete'
  })) as DocumentAccessLog[];
};

// Export the service as a default object
export const DocumentService = {
  getDocuments,
  getDocument,
  getCustomerDocuments,
  uploadFile,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  uploadDocumentVersion,
  getDocumentCategories,
  createDocumentCategory,
  logDocumentAccess,
  getDocumentAccessLogs,
};

export default DocumentService;
