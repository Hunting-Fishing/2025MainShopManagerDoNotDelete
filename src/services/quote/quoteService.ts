
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteItem, ConversionAudit, QuoteStatus, QuoteItemType } from '@/types/quote';

export async function getAllQuotes(): Promise<Quote[]> {
  console.log('quoteService: Fetching all quotes...');
  
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      customers (
        first_name,
        last_name,
        email,
        phone
      ),
      vehicles (
        year,
        make,
        model
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('quoteService: Error fetching quotes:', error);
    throw new Error(`Failed to fetch quotes: ${error.message}`);
  }

  console.log('quoteService: Raw quotes data:', data);

  // Transform and type cast the data properly
  const quotes: Quote[] = (data || []).map(quote => ({
    id: quote.id,
    quote_number: quote.quote_number,
    customer_id: quote.customer_id,
    vehicle_id: quote.vehicle_id,
    status: quote.status as QuoteStatus,
    subtotal: quote.subtotal || 0,
    tax_rate: quote.tax_rate || 0,
    tax_amount: quote.tax_amount || 0,
    total_amount: quote.total_amount || 0,
    expiry_date: quote.expiry_date,
    notes: quote.notes,
    terms_conditions: quote.terms_conditions,
    created_by: quote.created_by,
    created_at: quote.created_at,
    updated_at: quote.updated_at,
    sent_at: quote.sent_at,
    approved_at: quote.approved_at,
    rejected_at: quote.rejected_at,
    converted_at: quote.converted_at,
    converted_to_work_order_id: quote.converted_to_work_order_id,
    // UI fields from joins
    customer_name: quote.customers ? `${quote.customers.first_name} ${quote.customers.last_name}` : '',
    customer_email: quote.customers?.email || '',
    customer_phone: quote.customers?.phone || '',
    vehicle_year: quote.vehicles?.year || '',
    vehicle_make: quote.vehicles?.make || '',
    vehicle_model: quote.vehicles?.model || ''
  }));

  console.log('quoteService: Transformed quotes:', quotes);
  return quotes;
}

export async function getQuoteById(id: string): Promise<Quote | null> {
  console.log('quoteService: Fetching quote by ID:', id);
  
  const { data, error } = await supabase
    .from('quotes')
    .select(`
      *,
      customers (
        first_name,
        last_name,
        email,
        phone
      ),
      vehicles (
        year,
        make,
        model
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('quoteService: Error fetching quote:', error);
    throw new Error(`Failed to fetch quote: ${error.message}`);
  }

  if (!data) {
    console.log('quoteService: Quote not found');
    return null;
  }

  console.log('quoteService: Quote data:', data);

  // Transform the data properly
  const quote: Quote = {
    id: data.id,
    quote_number: data.quote_number,
    customer_id: data.customer_id,
    vehicle_id: data.vehicle_id,
    status: data.status as QuoteStatus,
    subtotal: data.subtotal || 0,
    tax_rate: data.tax_rate || 0,
    tax_amount: data.tax_amount || 0,
    total_amount: data.total_amount || 0,
    expiry_date: data.expiry_date,
    notes: data.notes,
    terms_conditions: data.terms_conditions,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    sent_at: data.sent_at,
    approved_at: data.approved_at,
    rejected_at: data.rejected_at,
    converted_at: data.converted_at,
    converted_to_work_order_id: data.converted_to_work_order_id,
    // UI fields from joins
    customer_name: data.customers ? `${data.customers.first_name} ${data.customers.last_name}` : '',
    customer_email: data.customers?.email || '',
    customer_phone: data.customers?.phone || '',
    vehicle_year: data.vehicles?.year || '',
    vehicle_make: data.vehicles?.make || '',
    vehicle_model: data.vehicles?.model || ''
  };

  return quote;
}

export async function getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
  console.log('quoteService: Fetching quote items for quote:', quoteId);
  
  const { data, error } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quoteId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('quoteService: Error fetching quote items:', error);
    throw new Error(`Failed to fetch quote items: ${error.message}`);
  }

  // Type cast the items properly
  const items: QuoteItem[] = (data || []).map(item => ({
    id: item.id,
    quote_id: item.quote_id,
    name: item.name,
    description: item.description,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.total_price,
    item_type: item.item_type as QuoteItemType,
    display_order: item.display_order,
    created_at: item.created_at,
    updated_at: item.updated_at
  }));

  console.log('quoteService: Quote items:', items);
  return items;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote | null> {
  console.log('quoteService: Updating quote status:', id, status);
  
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  // Set status-specific timestamps
  switch (status) {
    case 'sent':
      updateData.sent_at = new Date().toISOString();
      break;
    case 'approved':
      updateData.approved_at = new Date().toISOString();
      break;
    case 'rejected':
      updateData.rejected_at = new Date().toISOString();
      break;
  }

  const { data, error } = await supabase
    .from('quotes')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      customers (
        first_name,
        last_name,
        email,
        phone
      ),
      vehicles (
        year,
        make,
        model
      )
    `)
    .maybeSingle();

  if (error) {
    console.error('quoteService: Error updating quote status:', error);
    throw new Error(`Failed to update quote status: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Transform the data properly
  const quote: Quote = {
    id: data.id,
    quote_number: data.quote_number,
    customer_id: data.customer_id,
    vehicle_id: data.vehicle_id,
    status: data.status as QuoteStatus,
    subtotal: data.subtotal || 0,
    tax_rate: data.tax_rate || 0,
    tax_amount: data.tax_amount || 0,
    total_amount: data.total_amount || 0,
    expiry_date: data.expiry_date,
    notes: data.notes,
    terms_conditions: data.terms_conditions,
    created_by: data.created_by,
    created_at: data.created_at,
    updated_at: data.updated_at,
    sent_at: data.sent_at,
    approved_at: data.approved_at,
    rejected_at: data.rejected_at,
    converted_at: data.converted_at,
    converted_to_work_order_id: data.converted_to_work_order_id,
    // UI fields from joins
    customer_name: data.customers ? `${data.customers.first_name} ${data.customers.last_name}` : '',
    customer_email: data.customers?.email || '',
    customer_phone: data.customers?.phone || '',
    vehicle_year: data.vehicles?.year || '',
    vehicle_make: data.vehicles?.make || '',
    vehicle_model: data.vehicles?.model || ''
  };

  console.log('quoteService: Updated quote:', quote);
  return quote;
}

export async function convertQuoteToWorkOrder(quoteId: string, notes?: string): Promise<string> {
  console.log('quoteService: Converting quote to work order:', quoteId);
  
  // Get current user ID (you may need to adjust this based on your auth setup)
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('convert_quote_to_work_order', {
    p_quote_id: quoteId,
    p_converted_by: user.id,
    p_notes: notes || null
  });

  if (error) {
    console.error('quoteService: Error converting quote to work order:', error);
    throw new Error(`Failed to convert quote to work order: ${error.message}`);
  }

  console.log('quoteService: Work order created:', data);
  return data; // This should be the new work order ID
}

export async function convertWorkOrderToInvoice(workOrderId: string, notes?: string): Promise<string> {
  console.log('quoteService: Converting work order to invoice:', workOrderId);
  
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.rpc('convert_work_order_to_invoice', {
    p_work_order_id: workOrderId,
    p_converted_by: user.id,
    p_notes: notes || null
  });

  if (error) {
    console.error('quoteService: Error converting work order to invoice:', error);
    throw new Error(`Failed to convert work order to invoice: ${error.message}`);
  }

  console.log('quoteService: Invoice created:', data);
  return data; // This should be the new invoice ID
}

export async function getConversionAudit(): Promise<ConversionAudit[]> {
  console.log('quoteService: Fetching conversion audit records...');
  
  const { data, error } = await supabase
    .from('conversion_audit')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('quoteService: Error fetching conversion audit:', error);
    throw new Error(`Failed to fetch conversion audit: ${error.message}`);
  }

  // Type cast the audit records properly
  const auditRecords: ConversionAudit[] = (data || []).map(record => ({
    id: record.id,
    source_type: record.source_type as 'quote' | 'work_order',
    source_id: record.source_id,
    target_type: record.target_type as 'work_order' | 'invoice',
    target_id: record.target_id,
    converted_by: record.converted_by,
    conversion_notes: record.conversion_notes,
    created_at: record.created_at
  }));

  console.log('quoteService: Conversion audit records:', auditRecords);
  return auditRecords;
}
