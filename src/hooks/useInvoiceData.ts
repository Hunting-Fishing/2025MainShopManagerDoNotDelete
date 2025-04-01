import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchInvoices, 
  fetchInvoiceById, 
  saveInvoice, 
  deleteInvoice,
  updateInvoiceStatus,
  subscribeToInvoices
} from '@/services/invoiceService';
import { useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { toast } from '@/components/ui/use-toast';

export function useInvoiceData() {
  const queryClient = useQueryClient();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  
  // Query for fetching all invoices
  const invoicesQuery = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const data = await fetchInvoices();
      
      // Map the database fields to our Invoice type
      return data.map((invoice: any): Invoice => ({
        id: invoice.id,
        customer: invoice.customer,
        customerAddress: invoice.customer_address,
        customerEmail: invoice.customer_email,
        description: invoice.description || '',
        notes: invoice.notes || '',
        date: invoice.date,
        dueDate: invoice.due_date,
        status: invoice.status as "draft" | "pending" | "paid" | "overdue" | "cancelled",
        workOrderId: invoice.work_order_id || '',
        createdBy: invoice.created_by || '',
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        paymentMethod: invoice.payment_method || '',
        lastUpdatedBy: invoice.last_updated_by || '',
        lastUpdatedAt: invoice.last_updated_at,
        assignedStaff: [], // Will be populated if needed
        items: [], // Will be populated when fetching a single invoice
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation for saving an invoice
  const saveMutation = useMutation({
    mutationFn: ({ invoice, items }: { invoice: Invoice, items: InvoiceItem[] }) => 
      saveInvoice(invoice, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      console.error('Error saving invoice:', error);
      toast({
        title: 'Error saving invoice',
        description: error.message || 'Failed to save invoice. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for deleting an invoice
  const deleteMutation = useMutation({
    mutationFn: (invoiceId: string) => deleteInvoice(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Error deleting invoice',
        description: error.message || 'Failed to delete invoice. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for updating invoice status
  const updateStatusMutation = useMutation({
    mutationFn: ({ invoiceId, status }: { invoiceId: string, status: string }) => 
      updateInvoiceStatus(invoiceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      console.error('Error updating invoice status:', error);
      toast({
        title: 'Error updating status',
        description: error.message || 'Failed to update invoice status. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Custom hook to fetch a single invoice by ID
  const useInvoiceById = (invoiceId: string | undefined) => {
    return useQuery({
      queryKey: ['invoice', invoiceId],
      queryFn: async () => {
        if (!invoiceId) return null;
        const data = await fetchInvoiceById(invoiceId);
        
        if (!data) return null;
        
        // Map the database fields to our Invoice type
        return {
          id: data.id,
          customer: data.customer,
          customerAddress: data.customer_address,
          customerEmail: data.customer_email,
          description: data.description || '',
          notes: data.notes || '',
          date: data.date,
          dueDate: data.due_date,
          status: data.status as "draft" | "pending" | "paid" | "overdue" | "cancelled",
          workOrderId: data.work_order_id || '',
          createdBy: data.created_by || '',
          subtotal: data.subtotal,
          tax: data.tax,
          total: data.total,
          paymentMethod: data.payment_method || '',
          lastUpdatedBy: data.last_updated_by || '',
          lastUpdatedAt: data.last_updated_at,
          // Fix: Get assigned staff from invoice_staff table if it exists
          assignedStaff: data.invoice_staff?.map((s: any) => s.staff_name) || [],
          items: data.items?.map((item: any): InvoiceItem => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            hours: item.hours,
          })) || [],
        } as Invoice;
      },
      enabled: !!invoiceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Set up real-time subscription for invoices if enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return;
    
    const unsubscribe = subscribeToInvoices(() => {
      // When we receive a real-time update, invalidate the queries
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    });
    
    return () => {
      unsubscribe();
    };
  }, [queryClient, isRealTimeEnabled]);
  
  return {
    invoices: invoicesQuery.data as Invoice[] || [],
    isLoading: invoicesQuery.isLoading,
    isError: invoicesQuery.isError,
    error: invoicesQuery.error,
    refetch: invoicesQuery.refetch,
    
    saveInvoice: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    
    deleteInvoice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    
    useInvoiceById,
    
    isRealTimeEnabled,
    setIsRealTimeEnabled,
  };
}
