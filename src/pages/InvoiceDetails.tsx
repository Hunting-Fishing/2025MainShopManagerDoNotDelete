
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchInvoiceById } from "@/services/invoiceService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import InvoiceView from "@/components/invoices/InvoiceView";
import InvoicePDF from "@/components/invoices/InvoicePDF";
import { saveAs } from "file-saver";
import { Printer, Download } from "lucide-react";
import { calculateInvoiceTotals } from "@/utils/invoiceUtils";

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("view");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchInvoiceById(id);
        if (!data) {
          setError("Invoice not found");
        } else {
          // Calculate totals if not present
          if (!data.subtotal || !data.total) {
            const totals = calculateInvoiceTotals(data);
            setInvoice({
              ...data,
              subtotal: totals.subtotal,
              tax: totals.tax,
              total: totals.total,
              paymentMethod: data.paymentMethod || "Credit Card"
            });
          } else {
            setInvoice({
              ...data,
              paymentMethod: data.paymentMethod || "Credit Card"
            });
          }
        }
      } catch (err) {
        console.error('Error loading invoice:', err);
        setError("Failed to load invoice data");
        toast({
          title: "Error",
          description: "There was a problem loading the invoice.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Placeholder for PDF download functionality
    // In a real app, this would generate a PDF using a library like react-pdf
    try {
      // Create a Blob with invoice data
      const blob = new Blob(
        [JSON.stringify(invoice, null, 2)],
        { type: 'application/json' }
      );
      
      // Use file-saver to download the blob
      saveAs(blob, `invoice-${invoice.id}.json`);
      
      toast({
        title: "Invoice Downloaded",
        description: "The invoice has been downloaded successfully.",
      });
    } catch (err) {
      console.error('Error downloading invoice:', err);
      toast({
        title: "Download Failed",
        description: "There was a problem downloading the invoice.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading invoice...</span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Invoice Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The requested invoice could not be found."}</p>
          <Button onClick={() => navigate("/invoices")}>Back to Invoices</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice #{invoice.id}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="pdf">PDF Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <InvoiceView invoice={invoice} />
        </TabsContent>
        <TabsContent value="pdf">
          <Card className="p-6">
            <InvoicePDF invoice={invoice} />
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex space-x-2 justify-end">
        <Button variant="outline" onClick={() => navigate("/invoices")}>
          Back to Invoices
        </Button>
        <Button variant="outline" onClick={() => navigate(`/invoices/${id}/edit`)}>
          Edit Invoice
        </Button>
      </div>
    </div>
  );
}
