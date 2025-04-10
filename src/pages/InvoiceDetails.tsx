
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getInvoiceById } from "@/services/invoiceService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Invoice } from "@/types/invoice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceView } from "@/components/invoices/InvoiceView";
import { InvoicePDF } from "@/components/invoices/InvoicePDF";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { SaveAlt, Mail, Print, ArrowLeft } from "lucide-react";
import { FileIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { calculateInvoiceTotals } from "@/utils/invoiceUtils";

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const invoiceData = await getInvoiceById(id);
        setInvoice(invoiceData);
        
        // Add a small delay to ensure the PDF generation works properly
        setTimeout(() => {
          setPdfReady(true);
        }, 500);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast({
          title: "Error",
          description: "Could not load invoice details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, toast]);

  const handleSendInvoice = () => {
    if (!invoice || !invoice.customerEmail) {
      toast({
        title: "Cannot Send Invoice",
        description: "This invoice doesn't have a customer email address.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Invoice Sent",
      description: `Invoice has been sent to ${invoice.customerEmail}`,
    });
  };

  if (loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-12 w-1/4 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
            <CardDescription>The requested invoice could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate totals
  const { subtotal, tax, total } = calculateInvoiceTotals(invoice);
  
  // Ensure paymentMethod has a default value
  const invoiceWithDefaults = {
    ...invoice,
    subtotal,
    tax,
    total,
    paymentMethod: invoice.paymentMethod || "Not Specified"
  };

  if (showPdf) {
    return (
      <div className="container py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowPdf(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoice
          </Button>

          {pdfReady && (
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoiceWithDefaults} />}
              fileName={`invoice-${invoice.id}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button disabled={pdfLoading}>
                  <SaveAlt className="h-4 w-4 mr-2" />
                  {pdfLoading ? "Preparing PDF..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          )}
        </div>

        <Card className="h-[800px]">
          <PDFViewer width="100%" height="100%" className="border-0">
            <InvoicePDF invoice={invoiceWithDefaults} />
          </PDFViewer>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowPdf(true)}>
            <FileIcon className="h-4 w-4 mr-2" />
            View PDF
          </Button>

          <Button variant="outline" onClick={() => window.print()}>
            <Print className="h-4 w-4 mr-2" />
            Print
          </Button>

          <Button onClick={handleSendInvoice}>
            <Mail className="h-4 w-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      <InvoiceView invoice={invoiceWithDefaults} />
    </div>
  );
}
