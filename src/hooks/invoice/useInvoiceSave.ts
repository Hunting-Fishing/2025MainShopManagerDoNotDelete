
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Invoice } from "@/types/invoice";
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useInvoiceSave() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuthUser();

  // Handle saving invoice
  const handleSaveInvoice = async (
    invoice: Invoice, 
    items: any[], 
    assignedStaff: string[], 
    subtotal: number, 
    tax: number, 
    total: number,
    status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
  ) => {
    // Reset error state
    setError(null);
    
    // Basic validation
    if (!invoice.customer || !items.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one item.",
        variant: "destructive",
      });
      setError("Please fill in all required fields and add at least one item.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check for network connectivity
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
        throw new Error("Network offline");
      }
      
      // Create the invoice in Supabase
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          id: invoice.id,
          work_order_id: invoice.workOrderId || null,
          customer: invoice.customer,
          customer_email: invoice.customerEmail || null,
          customer_address: invoice.customerAddress || null,
          description: invoice.description || null,
          notes: invoice.notes || null,
          subtotal,
          tax,
          total,
          status,
          date: invoice.date,
          due_date: invoice.dueDate,
          created_by: userId || null,
          created_at: new Date().toISOString()
        });
      
      if (invoiceError) throw invoiceError;
      
      // Add invoice items
      if (items && items.length > 0) {
        const invoiceItems = items.map(item => ({
          invoice_id: invoice.id,
          name: item.name,
          description: item.description || '',
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }));
        
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems);
        
        if (itemsError) throw itemsError;
      }
      
      // Add assigned staff
      if (assignedStaff && assignedStaff.length > 0) {
        const staffEntries = assignedStaff.map(staff => ({
          invoice_id: invoice.id,
          staff_name: staff
        }));
        
        const { error: staffError } = await supabase
          .from('invoice_staff')
          .insert(staffEntries);
        
        if (staffError) throw staffError;
      }
      
      // Show success message
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoice.id} has been created successfully.`,
        variant: "success",
      });
      
      // Navigate to invoices list
      navigate("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the invoice. Please try again.",
        variant: "destructive",
      });
      setError("Error creating invoice. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSaveInvoice,
    error
  };
}
