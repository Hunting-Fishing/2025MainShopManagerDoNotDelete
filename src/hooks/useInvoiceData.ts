
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchInvoices, 
  fetchInvoiceById, 
  saveInvoice, 
  deleteInvoice,
  updateInvoiceStatus 
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
    queryFn: fetchInvoices,
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
      queryFn: () => invoiceId ? fetchInvoiceById(invoiceId) : null,
      enabled: !!invoiceId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  
  // Set up real-time subscription for invoices if enabled
  useEffect(() => {
    if (!isRealTimeEnabled) return;
    
    const { subscribeToInvoices } = require('@/services/invoiceService');
    
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
