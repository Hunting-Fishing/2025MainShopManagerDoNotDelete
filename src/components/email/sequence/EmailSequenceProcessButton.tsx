
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/email/emailService';

interface EmailSequenceProcessButtonProps {
  className?: string;
}

export function EmailSequenceProcessButton({ className }: EmailSequenceProcessButtonProps) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const success = await emailService.triggerSequenceProcessing();
      
      if (success) {
        toast({
          title: "Processing triggered",
          description: "Email sequences are now being processed",
        });
      } else {
        toast({
          title: "Processing failed",
          description: "Could not trigger email sequence processing",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error triggering sequence processing:", error);
      toast({
        title: "Processing error",
        description: "An error occurred while processing sequences",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      className={className} 
      onClick={handleProcess}
      disabled={isProcessing}
    >
      <Play className="h-4 w-4 mr-2" />
      Process Sequences Now
    </Button>
  );
}
