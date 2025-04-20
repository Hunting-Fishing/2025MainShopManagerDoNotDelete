
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { CustomerDocument, DocumentCategory, DocumentUploadParams } from '@/types/document';

// Work Order Document Functions
export async function uploadWorkOrderDocument(
  workOrderId: string,
  file: File,
  description?: string,
  category?: string
) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${workOrderId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError, data } = await supabase.storage
      .from('work_order_attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('work_order_attachments')
      .getPublicUrl(filePath);

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('work_order_documents')
      .insert({
        work_order_id: workOrderId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        description,
        category,
        file_size: file.size,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function uploadSignature(
  workOrderId: string,
  signatureBlob: Blob,
  signedBy: string,
  signatureType: 'customer' | 'technician'
) {
  try {
    const fileName = `${uuidv4()}.png`;
    const filePath = `signatures/${workOrderId}/${fileName}`;

    // Upload signature to storage
    const { error: uploadError } = await supabase.storage
      .from('work_order_attachments')
      .upload(filePath, signatureBlob);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('work_order_attachments')
      .getPublicUrl(filePath);

    // Create signature record
    const { data: signature, error: dbError } = await supabase
      .from('work_order_signatures')
      .insert({
        work_order_id: workOrderId,
        signature_url: publicUrl,
        signature_type: signatureType,
        signed_by: signedBy
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return signature;
  } catch (error) {
    console.error('Error uploading signature:', error);
    throw error;
  }
}

export async function getWorkOrderDocuments(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('work_order_documents')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

export async function getWorkOrderSignatures(workOrderId: string) {
  try {
    const { data, error } = await supabase
      .from('work_order_signatures')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching signatures:', error);
    throw error;
  }
}

// Customer Document Functions
export async function getCustomerDocuments(customerId: string) {
  try {
    const { data, error } = await supabase
      .from('customer_documents')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching customer documents:', error);
    throw error;
  }
}

export async function getDocumentCategories() {
  try {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching document categories:', error);
    throw error;
  }
}

export async function uploadDocument(params: DocumentUploadParams) {
  try {
    const { file, customerId, title, description, category, tags, isShared, versionNotes } = params;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `customers/${customerId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('work_order_attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('work_order_attachments')
      .getPublicUrl(filePath);

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const userName = 'System User'; // Ideally would fetch the user's name

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('customer_documents')
      .insert({
        customer_id: customerId,
        title,
        description,
        file_name: fileName,
        original_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        category,
        tags,
        is_shared: isShared || false,
        version: 1,
        version_notes: versionNotes,
        uploaded_by: userId,
        uploaded_by_name: userName
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return document;
  } catch (error) {
    console.error('Error uploading customer document:', error);
    throw error;
  }
}

export async function uploadDocumentVersion(documentId: string, file: File, versionNotes?: string) {
  try {
    // Get document to determine the path
    const { data: document, error: fetchError } = await supabase
      .from('customer_documents')
      .select('customer_id, version')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    const customerId = document.customer_id;
    const nextVersion = document.version + 1;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `customers/${customerId}/versions/${documentId}/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('work_order_attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const userName = 'System User'; // Ideally would fetch the user's name

    // Create version record
    const { data: version, error: versionError } = await supabase
      .from('document_versions')
      .insert({
        document_id: documentId,
        version_number: nextVersion,
        file_path: filePath,
        file_size: file.size,
        version_notes: versionNotes,
        uploaded_by: userId,
        uploaded_by_name: userName
      })
      .single();

    if (versionError) throw versionError;

    // Update document with new version
    const { error: updateError } = await supabase
      .from('customer_documents')
      .update({
        version: nextVersion,
        version_notes: versionNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) throw updateError;

    return version;
  } catch (error) {
    console.error('Error uploading document version:', error);
    throw error;
  }
}

export async function deleteDocument(documentId: string) {
  try {
    // Get document to determine the path
    const { data: document, error: fetchError } = await supabase
      .from('customer_documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('work_order_attachments')
      .remove([document.file_path]);

    // Note: We're continuing even if storage deletion fails
    if (storageError) console.error('Error deleting file from storage:', storageError);

    // Delete the document record
    const { error: dbError } = await supabase
      .from('customer_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export async function getDocumentDownloadUrl(filePath: string) {
  try {
    const { data } = supabase.storage
      .from('work_order_attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting download URL:', error);
    throw error;
  }
}

export async function getDocumentPreviewUrl(filePath: string) {
  // For simplicity, we're using the same URL for preview and download
  // In a production app, you might generate thumbnails or have a separate viewer
  return getDocumentDownloadUrl(filePath);
}
