import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Invoice, createInvoiceUpdater, InvoiceTemplate } from "@/types/invoice";
import { SaveTemplateDialog } from "../templates/SaveTemplateDialog";
import { InvoiceTemplateDialog } from "../templates/InvoiceTemplateDialog";
import { useToast } from "@/hooks/use-toast";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  setInvoice: React.Dispatch<React.SetStateAction<Invoice>>;
  templates: InvoiceTemplate[];
  onApplyTemplate: (template: InvoiceTemplate) => void;
  onSaveTemplate: (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => void;
}

export function InvoiceLeftColumn({
  invoice,
  setInvoice,
  templates,
  onApplyTemplate,
  onSaveTemplate
}: InvoiceLeftColumnProps) {
  const today = new Date().toISOString().split("T")[0];
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    customer: invoice.customer || "",
    customerEmail: invoice.customerEmail || "",
    customerAddress: invoice.customerAddress || "",
    date: invoice.date || today,
    due_date: invoice.due_date || futureDate,
    paymentMethod: invoice.paymentMethod || "",
    notes: invoice.notes || "",
    description: invoice.description || "",
  });

  const [date, setDate] = React.useState<DateRange>({
    from: invoice.date ? new Date(invoice.date) : new Date(),
    to: invoice.due_date ? new Date(invoice.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      customer: invoice.customer || "",
      customerEmail: invoice.customerEmail || "",
      customerAddress: invoice.customerAddress || "",
      date: invoice.date || today,
      due_date: invoice.due_date || futureDate,
      paymentMethod: invoice.paymentMethod || "",
      notes: invoice.notes || "",
      description: invoice.description || "",
    });
  }, [invoice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setInvoice(createInvoiceUpdater({
      [name]: value
    }));
  };

  const handleDateChange = (value: string) => {
    setInvoice(createInvoiceUpdater({
      date: value
    }));
  };

  const handleDueDateChange = (value: string) => {
    setInvoice(createInvoiceUpdater({
      due_date: value
    }));
  };

  const handleTemplateApplied = (template: InvoiceTemplate) => {
    onApplyTemplate(template);
  };

  const handleTemplateCreated = (template: Omit<InvoiceTemplate, "id" | "createdAt" | "usageCount">) => {
    onSaveTemplate(template);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <Label htmlFor="customer">Customer</Label>
          <Input
            type="text"
            id="customer"
            name="customer"
            value={formData.customer}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="customerEmail">Customer Email</Label>
          <Input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="customerAddress">Customer Address</Label>
          <Input
            type="text"
            id="customerAddress"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Invoice Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date?.from && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    format(date.from, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <CalendarComponent
                  mode="single"
                  selected={date?.from}
                  onSelect={(value) => {
                    setDate({
                      from: value,
                      to: date?.to
                    });
                    handleDateChange(value?.toISOString().split('T')[0] || '');
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date?.to && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date?.to ? (
                    format(date.to, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <CalendarComponent
                  mode="single"
                  selected={date?.to}
                  onSelect={(value) => {
                    setDate({
                      from: date?.from,
                      to: value
                    });
                    handleDueDateChange(value?.toISOString().split('T')[0] || '');
                  }}
                  disabled={(date) =>
                    date < (date?.from || new Date("1900-01-01"))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Input
            type="text"
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            type="text"
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
        <SaveTemplateDialog
          open={showSaveTemplateDialog}
          onOpenChange={setShowSaveTemplateDialog}
          invoiceItems={invoice.items || []}
          defaultNotes={invoice.notes || ''}
          defaultDueDateDays={30}
          defaultTaxRate={0.08}
          onSaveSuccess={handleTemplateCreated}
        />
      </CardContent>
    </Card>
  );
}
