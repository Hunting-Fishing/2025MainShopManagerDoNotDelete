
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceBasicInfoProps {
  invoiceId: string;
  status: string;
  date: string;
  dueDate: string;
  onInvoiceIdChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
}

export function InvoiceBasicInfo({
  invoiceId,
  status,
  date,
  dueDate,
  onInvoiceIdChange,
  onStatusChange,
  onDateChange,
  onDueDateChange,
}: InvoiceBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <Label htmlFor="invoice-id">Invoice Number</Label>
        <Input 
          id="invoice-id" 
          value={invoiceId} 
          onChange={(e) => onInvoiceIdChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={status}
          onValueChange={onStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="issue-date">Issue Date</Label>
        <Input 
          id="issue-date" 
          type="date" 
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="due-date">Due Date</Label>
        <Input 
          id="due-date" 
          type="date" 
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
        />
      </div>
    </div>
  );
}
