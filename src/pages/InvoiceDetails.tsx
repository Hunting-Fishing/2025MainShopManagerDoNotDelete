
import { useParams } from "react-router-dom";
import { InvoiceDetailsHeader } from "@/components/invoices/InvoiceDetailsHeader";
import { InvoiceDetailsContent } from "@/components/invoices/InvoiceDetailsContent";
import { PaymentHistoryList } from "@/components/payments/PaymentHistoryList";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Invoice } from "@/types/invoice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Status styling
const statusStyles = {
  "paid": { label: "Paid", classes: "bg-green-100 text-green-800" },
  "pending": { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  "overdue": { label: "Overdue", classes: "bg-red-100 text-red-800" },
  "draft": { label: "Draft", classes: "bg-slate-100 text-slate-800" },
  "cancelled": { label: "Cancelled", classes: "bg-slate-100 text-slate-800" },
};

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch invoice data from Supabase
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            invoice_items(*)
          `)
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error("Invoice not found");
        }
        
        // Create the invoice with required properties
        const formattedInvoice: Invoice = {
          id: data.id,
          customer: data.customer,
          customerAddress: data.customer_address || '',
          customerEmail: data.customer_email || '',
          description: data.description || '',
          notes: data.notes || '',
          status: data.status as "draft" | "pending" | "paid" | "overdue" | "cancelled",
          date: data.date || '',
          dueDate: data.due_date || '',
          total: data.total || 0,
          subtotal: data.subtotal || 0,
          tax: data.tax || 0,
          workOrderId: data.work_order_id || '',
          createdBy: data.created_by || '',
          paymentMethod: data.payment_method || '',
          assignedStaff: [], // Initialize with empty array
          items: data.invoice_items || [],
          customer_id: data.customer_id, // Include optional customer_id
        };
        
        // Fetch assigned staff members if needed
        const { data: staffData } = await supabase
          .from('invoice_staff')
          .select('staff_name')
          .eq('invoice_id', id);
          
        if (staffData && staffData.length > 0) {
          formattedInvoice.assignedStaff = staffData.map(staff => staff.staff_name);
        }
        
        setInvoice(formattedInvoice);
      } catch (err: any) {
        console.error('Error fetching invoice:', err);
        setError(err.message || "An error occurred while fetching the invoice");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id]);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  if (error || !invoice) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || "Could not load invoice details. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Ensure data has the necessary properties for the components
  const headerInvoice = {
    ...invoice,
    paymentMethod: invoice.paymentMethod || ''
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <InvoiceDetailsHeader 
        invoiceId={invoice.id}
        status={invoice.status}
        statusStyles={statusStyles}
        invoice={headerInvoice}
      />
      
      {/* Tabs for Invoice details and Payments */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-4">
          {/* Content */}
          <InvoiceDetailsContent 
            invoice={invoice}
            statusStyles={statusStyles}
          />
        </TabsContent>
        
        <TabsContent value="payments" className="mt-4">
          {invoice.customer_id ? (
            <PaymentHistoryList 
              customerId={invoice.customer_id} 
              invoiceId={invoice.id} 
              allowAddPayment={true}
            />
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Customer ID</AlertTitle>
              <AlertDescription>
                This invoice doesn't have a customer ID associated with it, so payment tracking is limited.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
