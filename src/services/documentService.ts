
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

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
