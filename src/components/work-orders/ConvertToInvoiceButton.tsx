
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Receipt, Loader2, AlertTriangle } from 'lucide-react';
import { convertWorkOrderToInvoice } from '@/services/quote/quoteService';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConvertToInvoiceButtonProps {
  workOrderId: string;
  workOrderStatus: string;
  onSuccess?: (invoiceId: string) => void;
}

export function ConvertToInvoiceButton({ 
  workOrderId, 
  workOrderStatus,
  onSuccess 
}: ConvertToInvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const canConvert = workOrderStatus === 'completed';

  const handleConvert = async () => {
    if (!canConvert) {
      toast({
        title: "Cannot Convert",
        description: "Work order must be completed before converting to invoice",
        variant: "destructive"
      });
      return;
    }

    setIsConverting(true);
    try {
      const invoiceId = await convertWorkOrderToInvoice(workOrderId, notes);
      
      toast({
        title: "Success",
        description: "Work order converted to invoice successfully"
      });
      
      setIsOpen(false);
      setNotes('');
      onSuccess?.(invoiceId);
    } catch (error: any) {
      console.error('Error converting to invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert work order to invoice",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={canConvert ? "default" : "outline"}
          size="sm"
          disabled={!canConvert}
          className={`flex items-center gap-2 ${
            canConvert 
              ? "bg-green-600 hover:bg-green-700 text-white" 
              : "opacity-60"
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Convert to Invoice</span>
          <span className="sm:hidden">Invoice</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-green-600" />
            Convert to Invoice
          </DialogTitle>
          <DialogDescription>
            This will create a new invoice from this work order including all job lines and parts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!canConvert && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Work order must be completed before it can be converted to an invoice.
                Current status: <span className="font-medium capitalize">{workOrderStatus}</span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Conversion Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this conversion..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              These notes will be included in the invoice details.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isConverting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvert}
            disabled={isConverting || !canConvert}
            className="bg-green-600 hover:bg-green-700"
          >
            {isConverting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
