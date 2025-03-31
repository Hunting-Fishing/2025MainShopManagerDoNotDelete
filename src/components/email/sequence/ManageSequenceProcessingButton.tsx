
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ManageSequenceProcessingButtonProps {
  className?: string;
}

export function ManageSequenceProcessingButton({ className }: ManageSequenceProcessingButtonProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [open, setOpen] = useState(false);
  const [sequences, setSequences] = useState<any[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<string>('all');
  const [loadingSequences, setLoadingSequences] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      fetchSequences();
    }
  };

  const fetchSequences = async () => {
    setLoadingSequences(true);
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
        
      if (error) throw error;
      setSequences(data || []);
    } catch (error) {
      console.error('Error fetching sequences:', error);
      toast({
        title: 'Error',
        description: 'Could not load email sequences',
        variant: 'destructive',
      });
    } finally {
      setLoadingSequences(false);
    }
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      // Prepare parameters for the function call
      const params = {
        action: 'process',
      };
      
      // If a specific sequence is selected, add it to the parameters
      if (selectedSequence !== 'all') {
        params.sequenceId = selectedSequence;
      }
      
      const { data, error } = await supabase.functions.invoke('process-email-sequences', {
        body: params
      });
      
      if (error) throw error;
      
      // Display success message with results
      const processed = data?.processed || 0;
      const completed = data?.completed || 0;
      
      toast({
        title: "Processing succeeded",
        description: `Processed ${processed} emails, completed ${completed} sequences.`,
      });
      
      setOpen(false);
    } catch (error) {
      console.error("Error processing sequences:", error);
      toast({
        title: "Processing failed",
        description: "Could not process email sequences",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          size="sm" 
          className={className}
        >
          <Clock className="h-4 w-4 mr-2" />
          Process Sequences
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Email Sequences</DialogTitle>
          <DialogDescription>
            Process scheduled email sequences now. This will send any due emails and update sequence enrollments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sequence-select">Select Sequence</Label>
            <Select
              disabled={loadingSequences}
              value={selectedSequence}
              onValueChange={setSelectedSequence}
            >
              <SelectTrigger id="sequence-select">
                <SelectValue placeholder="Select a sequence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Active Sequences</SelectItem>
                {sequences.map((sequence) => (
                  <SelectItem key={sequence.id} value={sequence.id}>
                    {sequence.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleProcess}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" /> Process Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
