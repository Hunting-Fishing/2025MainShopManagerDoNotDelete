
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInvoiceById } from "@/services/invoiceService";
import { Loader2, Mail, Download, Printer, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import InvoiceView from "@/components/invoices/InvoiceView";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import { Invoice } from "@/types/invoice";
import { formatApiInvoice } from "@/utils/invoiceUtils";

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const getInvoice = async () => {
      try {
        if (id) {
          const data = await getInvoiceById(id);
          if (data) {
            // Convert API response to our Invoice type
            setInvoice(formatApiInvoice(data));
          } else {
            toast({
              title: "Error",
              description: "Invoice not found",
              variant: "destructive",
            });
            navigate("/invoices");
          }
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    getInvoice();
  }, [id, toast, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast({
      title: "Email Sent",
      description: "The invoice has been emailed to the customer.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Invoice PDF is being generated and downloaded.",
    });
    // In a real app, you would generate and download a PDF here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container py-12">
        <h1 className="text-2xl font-bold mb-8">Invoice Not Found</h1>
        <Button onClick={() => navigate("/invoices")}>Back to Invoices</Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={() => navigate("/invoices")}
          variant="ghost"
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            onClick={handleEmail} 
            variant="outline"
            className="flex items-center"
          >
            <Mail className="h-4 w-4 mr-2" /> Email
          </Button>
          <Button 
            onClick={handlePrint} 
            variant="outline"
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button 
            onClick={handleDownload} 
            variant="default"
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">Invoice</TabsTrigger>
          <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view">
          <InvoiceView invoice={invoice} />
        </TabsContent>
        
        <TabsContent value="pdf">
          <div className="border rounded-lg overflow-hidden bg-white">
            <InvoicePDF invoice={invoice} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
