
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteItem, QuoteFormValues, ConversionAudit } from '@/types/quote';

export const getAllQuotes = async (): Promise<Quote[]> => {
  try {
    console.log('Fetching all quotes...');
    
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers:customer_id (
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
          year,
          make,
          model
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }

    console.log('Quotes fetched successfully:', data?.length);
    
    return data?.map(quote => ({
      ...quote,
      customer_name: quote.customers ? 
        `${quote.customers.first_name} ${quote.customers.last_name}` : 
        'Unknown Customer',
      customer_email: quote.customers?.email || '',
      customer_phone: quote.customers?.phone || '',
      vehicle_year: quote.vehicles?.year?.toString() || '',
      vehicle_make: quote.vehicles?.make || '',
      vehicle_model: quote.vehicles?.model || ''
    })) || [];
  } catch (error) {
    console.error('Error in getAllQuotes:', error);
    throw error;
  }
};

export const getQuoteById = async (id: string): Promise<Quote | null> => {
  try {
    console.log('Fetching quote by ID:', id);
    
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers:customer_id (
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          postal_code
        ),
        vehicles:vehicle_id (
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quote:', error);
      throw error;
    }

    if (!data) return null;

    // Fetch quote items
    const { data: items, error: itemsError } = await supabase
      .from('quote_items')
      .select('*')
      .eq('quote_id', id)
      .order('display_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching quote items:', itemsError);
      throw itemsError;
    }

    return {
      ...data,
      customer_name: data.customers ? 
        `${data.customers.first_name} ${data.customers.last_name}` : 
        'Unknown Customer',
      customer_email: data.customers?.email || '',
      customer_phone: data.customers?.phone || '',
      vehicle_year: data.vehicles?.year?.toString() || '',
      vehicle_make: data.vehicles?.make || '',
      vehicle_model: data.vehicles?.model || '',
      items: items || []
    };
  } catch (error) {
    console.error('Error in getQuoteById:', error);
    throw error;
  }
};

export const createQuote = async (quoteData: QuoteFormValues): Promise<Quote | null> => {
  try {
    console.log('Creating quote:', quoteData);

    // Calculate totals
    const subtotal = quoteData.items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const tax_rate = 0.08;
    const tax_amount = subtotal * tax_rate;
    const total_amount = subtotal + tax_amount;

    // Create quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        customer_id: quoteData.customer_id,
        vehicle_id: quoteData.vehicle_id || null,
        subtotal,
        tax_rate,
        tax_amount,
        total_amount,
        expiry_date: quoteData.expiry_date || null,
        notes: quoteData.notes || null,
        terms_conditions: quoteData.terms_conditions || null,
        status: 'draft'
      })
      .select()
      .single();

    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      throw quoteError;
    }

    // Create quote items
    if (quoteData.items.length > 0) {
      const items = quoteData.items.map((item, index) => ({
        quote_id: quote.id,
        name: item.name,
        description: item.description || null,
        category: item.category || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        item_type: item.item_type,
        display_order: index
      }));

      const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(items);

      if (itemsError) {
        console.error('Error creating quote items:', itemsError);
        throw itemsError;
      }
    }

    console.log('Quote created successfully:', quote.id);
    return await getQuoteById(quote.id);
  } catch (error) {
    console.error('Error in createQuote:', error);
    throw error;
  }
};

export const updateQuoteStatus = async (
  id: string, 
  status: Quote['status']
): Promise<Quote | null> => {
  try {
    console.log('Updating quote status:', id, status);
    
    const updateData: any = { status };
    
    // Set timestamp fields based on status
    if (status === 'sent') updateData.sent_at = new Date().toISOString();
    if (status === 'approved') updateData.approved_at = new Date().toISOString();
    if (status === 'rejected') updateData.rejected_at = new Date().toISOString();

    const { error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating quote status:', error);
      throw error;
    }

    console.log('Quote status updated successfully');
    return await getQuoteById(id);
  } catch (error) {
    console.error('Error in updateQuoteStatus:', error);
    throw error;
  }
};

export const convertQuoteToWorkOrder = async (
  quoteId: string,
  notes?: string
): Promise<string> => {
  try {
    console.log('Converting quote to work order:', quoteId);
    
    const { data, error } = await supabase.rpc('convert_quote_to_work_order', {
      p_quote_id: quoteId,
      p_converted_by: 'current-user', // Replace with actual user ID
      p_notes: notes || null
    });

    if (error) {
      console.error('Error converting quote to work order:', error);
      throw error;
    }

    console.log('Quote converted to work order successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in convertQuoteToWorkOrder:', error);
    throw error;
  }
};

export const convertWorkOrderToInvoice = async (
  workOrderId: string,
  notes?: string
): Promise<string> => {
  try {
    console.log('Converting work order to invoice:', workOrderId);
    
    const { data, error } = await supabase.rpc('convert_work_order_to_invoice', {
      p_work_order_id: workOrderId,
      p_converted_by: 'current-user', // Replace with actual user ID
      p_notes: notes || null
    });

    if (error) {
      console.error('Error converting work order to invoice:', error);
      throw error;
    }

    console.log('Work order converted to invoice successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in convertWorkOrderToInvoice:', error);
    throw error;
  }
};

export const getConversionHistory = async (
  sourceType: 'quote' | 'work_order',
  sourceId: string
): Promise<ConversionAudit[]> => {
  try {
    const { data, error } = await supabase
      .from('conversion_audit')
      .select('*')
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversion history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getConversionHistory:', error);
    throw error;
  }
};

export const deleteQuote = async (id: string): Promise<boolean> => {
  try {
    console.log('Deleting quote:', id);
    
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }

    console.log('Quote deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteQuote:', error);
    return false;
  }
};
