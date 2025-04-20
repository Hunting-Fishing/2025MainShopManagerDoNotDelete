
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";

interface CreateInvoiceButtonProps {
  workOrder: WorkOrder;
  disabled?: boolean;
}

export function CreateInvoiceButton({ workOrder, disabled }: CreateInvoiceButtonProps) {
  const navigate = useNavigate();
  const isInvoiced = !!workOrder.invoice_id;

  const handleCreateInvoice = () => {
    navigate(`/invoices/create?workOrderId=${workOrder.id}`);
  };

  return (
    <Button
      onClick={handleCreateInvoice}
      disabled={disabled || isInvoiced}
      variant="outline"
      className="flex items-center gap-2"
    >
      <FileText className="h-4 w-4" />
      {isInvoiced ? 'Already Invoiced' : 'Create Invoice'}
    </Button>
  );
}
