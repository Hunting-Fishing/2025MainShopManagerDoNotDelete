
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Download, Printer, Edit, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Mock data - in a real app would be fetched based on ID
const invoiceData = {
  id: "INV-2023-001",
  workOrderId: "WO-2023-0012",
  customer: "Acme Corporation",
  customerAddress: "123 Business Park, Suite 400, San Francisco, CA 94107",
  customerEmail: "billing@acmecorp.com",
  description: "HVAC System Repair",
  notes: "All work completed according to specifications. 1-year warranty on parts and labor.",
  total: 1250.00,
  subtotal: 1150.00,
  tax: 100.00,
  status: "paid",
  paymentMethod: "Credit Card",
  date: "2023-08-16",
  dueDate: "2023-09-15",
  createdBy: "Michael Brown",
  items: [
    { id: 1, name: "HVAC Filter - Premium", description: "High-efficiency particulate air filter", quantity: 2, price: 24.99, total: 49.98 },
    { id: 2, name: "Service Labor", description: "Technician hours for system repair and maintenance", quantity: 6, hours: true, price: 200.00, total: 1200.00 }
  ]
};

// Status styling
const statusStyles = {
  "paid": { label: "Paid", classes: "bg-green-100 text-green-800" },
  "pending": { label: "Pending", classes: "bg-yellow-100 text-yellow-800" },
  "overdue": { label: "Overdue", classes: "bg-red-100 text-red-800" },
  "draft": { label: "Draft", classes: "bg-slate-100 text-slate-800" },
};

export default function InvoiceDetails() {
  const { id } = useParams<{ id: string }>();
  
  // In a real app, you would fetch invoice data based on ID
  const invoice = invoiceData;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link to="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Invoice {invoice.id}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[invoice.status as keyof typeof statusStyles].classes}`}>
            {statusStyles[invoice.status as keyof typeof statusStyles].label}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Send className="h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button asChild variant="default" className="flex items-center gap-1 bg-esm-blue-600 hover:bg-esm-blue-700">
            <Link to={`/invoices/${invoice.id}/edit`}>
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-5xl mx-auto">
        {/* Invoice header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
            <p className="text-slate-500">{invoice.id}</p>
            <div className="mt-4">
              <p className="font-medium">Date Issued: {invoice.date}</p>
              <p className="font-medium">Due Date: {invoice.dueDate}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-esm-blue-600">Easy Shop Manager</div>
            <div className="text-slate-500">Work Order System</div>
            <div className="mt-2 text-sm text-slate-500">
              <p>123 Main Street</p>
              <p>Anytown, CA 12345</p>
              <p>Phone: (555) 123-4567</p>
              <p>Email: billing@easyshopmanager.com</p>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        {/* Customer info and work order reference */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Bill To:</h3>
            <div className="text-slate-800">
              <p className="font-bold">{invoice.customer}</p>
              <p>{invoice.customerAddress}</p>
              <p>{invoice.customerEmail}</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Work Order Reference:</h3>
            <Link 
              to={`/work-orders/${invoice.workOrderId}`} 
              className="font-medium text-esm-blue-600 hover:text-esm-blue-800"
            >
              {invoice.workOrderId}
            </Link>
            <p className="text-slate-500 mt-1">{invoice.description}</p>
          </div>
        </div>
        
        {/* Items table */}
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3 border-b border-slate-200">Item</th>
                <th className="px-4 py-3 border-b border-slate-200">Description</th>
                <th className="px-4 py-3 border-b border-slate-200 text-center">Quantity</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">Price</th>
                <th className="px-4 py-3 border-b border-slate-200 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.description}</td>
                  <td className="px-4 py-4 text-sm text-slate-500 text-center">{item.quantity}</td>
                  <td className="px-4 py-4 text-sm text-slate-500 text-right">
                    ${item.price.toFixed(2)}{item.hours ? "/hr" : ""}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900 text-right">
                    ${item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}></td>
                <td className="px-4 py-3 text-sm font-medium text-slate-500 text-right">Subtotal:</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">${invoice.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3}></td>
                <td className="px-4 py-3 text-sm font-medium text-slate-500 text-right">Tax:</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">${invoice.tax.toFixed(2)}</td>
              </tr>
              <tr className="bg-slate-50">
                <td colSpan={3}></td>
                <td className="px-4 py-3 text-base font-bold text-slate-800 text-right">Total:</td>
                <td className="px-4 py-3 text-base font-bold text-slate-800 text-right">${invoice.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Notes:</h3>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-md">{invoice.notes}</p>
          </div>
        )}
        
        {/* Payment information */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Payment Information:</h3>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Payment Method: {invoice.paymentMethod || "N/A"}</p>
              <p className="text-sm text-slate-500">Payment Status: {statusStyles[invoice.status as keyof typeof statusStyles].label}</p>
            </div>
            <div className="text-sm text-slate-500">
              <p>Created By: {invoice.createdBy}</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
