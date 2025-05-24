
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StaffMember, Invoice, InvoiceTemplate } from "@/types/invoice";

interface InvoiceLeftColumnProps {
  invoice: Invoice;
  onInvoiceChange: (field: string, value: any) => void;
  onSaveTemplate: (templateData: Omit<InvoiceTemplate, "id" | "created_at" | "usage_count">) => void;
}

export function InvoiceLeftColumn({ 
  invoice, 
  onInvoiceChange, 
  onSaveTemplate 
}: InvoiceLeftColumnProps) {
  const handleSaveAsTemplate = () => {
    const templateName = prompt("Enter template name:");
    const templateDescription = prompt("Enter template description:");
    
    if (templateName) {
      const templateData = {
        name: templateName,
        description: templateDescription || "",
        default_items: invoice.items || [],
        default_tax_rate: invoice.tax_rate || 0.08,
        default_notes: invoice.notes || "",
        default_due_date_days: 30,
        last_used: null
      };
      
      onSaveTemplate(templateData);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name</Label>
            <Input
              id="customer"
              value={invoice.customer}
              onChange={(e) => onInvoiceChange('customer', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer_email">Customer Email</Label>
            <Input
              id="customer_email"
              type="email"
              value={invoice.customer_email || ''}
              onChange={(e) => onInvoiceChange('customer_email', e.target.value)}
              placeholder="Enter customer email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer_address">Customer Address</Label>
            <Textarea
              id="customer_address"
              value={invoice.customer_address || ''}
              onChange={(e) => onInvoiceChange('customer_address', e.target.value)}
              placeholder="Enter customer address"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={invoice.description || ''}
              onChange={(e) => onInvoiceChange('description', e.target.value)}
              placeholder="Enter invoice description"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={invoice.notes || ''}
              onChange={(e) => onInvoiceChange('notes', e.target.value)}
              placeholder="Enter invoice notes"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Template Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSaveAsTemplate} variant="outline" className="w-full">
            Save as Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
