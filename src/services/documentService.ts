
import { supabase } from "@/integrations/supabase/client";
import { CustomerDocument, DocumentCategory, DocumentUploadParams, DocumentVersion } from "@/types/document";

// Upload a new document
export const uploadDocument = async (params: DocumentUploadParams): Promise<CustomerDocument | null> => {
  try {
    const { file, customerId, title, description, category, tags, isShared, versionNotes } = params;
    
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${customerId}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('customer_documents')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Create document record in database
    const { data: documentData, error: documentError } = await supabase
      .from('customer_documents')
      .insert([
        {
          customer_id: customerId,
          file_name: fileName,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          original_name: file.name,
          title,
          description,
          category,
          tags,
          is_shared: isShared || false,
          version: 1,
          version_notes: versionNotes,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || 'unknown',
          uploaded_by_name: 'Current User' // You should get the actual user name here
        }
      ])
      .select()
      .single();
    
    if (documentError) {
      // If there's an error, delete the uploaded file
      await supabase.storage
        .from('customer_documents')
        .remove([filePath]);
      
      throw documentError;
    }
    
    return documentData;
  } catch (error) {
    console.error("Error uploading document:", error);
    return null;
  }
};

// Update a document
export const updateDocument = async (
  documentId: string,
  updates: Partial<CustomerDocument>
): Promise<CustomerDocument | null> => {
  try {
    const { data, error } = await supabase
      .from('customer_documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating document:", error);
    return null;
  }
};

// Delete a document
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  try {
    // Get the document to get the file path
    const { data: document, error: getError } = await supabase
      .from('customer_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();
    
    if (getError) throw getError;
    
    // Delete the document record
    const { error: deleteError } = await supabase
      .from('customer_documents')
      .delete()
      .eq('id', documentId);
    
    if (deleteError) throw deleteError;
    
    // Delete the file from storage
    if (document && document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('customer_documents')
        .remove([document.file_path]);
      
      if (storageError) throw storageError;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    return false;
  }
};

// Upload a new version of a document
export const uploadDocumentVersion = async (
  documentId: string,
  file: File,
  versionNotes?: string
): Promise<DocumentVersion | null> => {
  try {
    // Get current document
    const { data: document, error: docError } = await supabase
      .from('customer_documents')
      .select('customer_id, version')
      .eq('id', documentId)
      .single();
    
    if (docError) throw docError;
    
    const newVersion = ((document).version || 0) + 1;
    
    // 1. Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_v${newVersion}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${(document).customer_id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('customer_documents')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // 2. Create version record in database
    const { data: versionData, error: versionError } = await supabase
      .from('document_versions')
      .insert([
        {
          document_id: documentId,
          version_number: newVersion,
          file_path: filePath,
          file_size: file.size,
          version_notes: versionNotes,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id || 'unknown',
          uploaded_by_name: 'Current User' // You should get the actual user name here
        }
      ])
      .select()
      .single();
    
    if (versionError) {
      // If there's an error, delete the uploaded file
      await supabase.storage
        .from('customer_documents')
        .remove([filePath]);
      
      throw versionError;
    }
    
    // 3. Update document record with new version number
    await supabase
      .from('customer_documents')
      .update({ 
        version: newVersion,
        file_name: fileName,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        original_name: file.name,
        version_notes: versionNotes
      })
      .eq('id', documentId);
    
    return versionData;
  } catch (error) {
    console.error("Error uploading document version:", error);
    return null;
  }
};

// Get a document's versions
export const getDocumentVersions = async (documentId: string): Promise<DocumentVersion[]> => {
  try {
    const { data, error } = await supabase
      .from('document_versions')
      .select('*')
      .eq('document_id', documentId)
      .order('version_number', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching document versions:", error);
    return [];
  }
};

// Get customer documents
export const getCustomerDocuments = async (customerId: string): Promise<CustomerDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('customer_documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching customer documents:", error);
    return [];
  }
};

// Get document categories
export const getDocumentCategories = async (): Promise<DocumentCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching document categories:", error);
    return [];
  }
};

// Create a document category
export const createDocumentCategory = async (
  name: string, 
  description?: string
): Promise<DocumentCategory | null> => {
  try {
    const user = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('document_categories')
      .insert([
        {
          name,
          description,
          shop_id: 'default-shop', // You should get the actual shop ID here
          created_by: user.data.user?.id || 'unknown'
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating document category:", error);
    return null;
  }
};

// Get document download URL
export const getDocumentDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('customer_documents')
      .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry
    
    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting document download URL:", error);
    return null;
  }
};

// Get document preview URL (if the file type supports it)
export const getDocumentPreviewUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('customer_documents')
      .createSignedUrl(filePath, 60 * 30); // 30 minutes expiry
    
    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting document preview URL:", error);
    return null;
  }
};
