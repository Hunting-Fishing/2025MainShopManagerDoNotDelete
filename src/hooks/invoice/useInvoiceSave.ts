import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Invoice, StaffMember } from "@/types/invoice";
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useInvoiceSave() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuthUser();

  const handleSaveInvoice = async (
    invoice: Invoice, 
    items: any[], 
    assignedStaff: StaffMember[], 
    subtotal: number, 
    tax: number, 
    total: number,
    status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
  ) => {
    setError(null);
    
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
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network and try again.");
        throw new Error("Network offline");
      }
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert([
          {
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
            due_date: invoice.due_date,
            created_by: userId || null,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (invoiceError) throw invoiceError;
      
      if (invoice.workOrderId) {
        const { error: workOrderError } = await supabase
          .from('work_orders')
          .update({
            invoice_id: invoiceData.id,
            invoiced_at: new Date().toISOString()
          })
          .eq('id', invoice.workOrderId);
        
        if (workOrderError) throw workOrderError;
      }
      
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
      
      if (assignedStaff && assignedStaff.length > 0) {
        const staffEntries = assignedStaff.map(staff => ({
          invoice_id: invoice.id,
          staff_id: staff.id,
          staff_name: staff.name,
          staff_role: staff.role || null
        }));
        
        const { error: staffError } = await supabase
          .from('invoice_staff')
          .insert(staffEntries);
        
        if (staffError) throw staffError;
      }
      
      toast({
        title: "Invoice Created",
        description: `Invoice ${invoice.id} has been created successfully.`,
        variant: "success",
      });
      
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
