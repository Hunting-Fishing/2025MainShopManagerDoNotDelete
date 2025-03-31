
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/email';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function ManageSequenceProcessingButton() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const success = await emailService.triggerSequenceProcessing();
      
      if (success) {
        toast({
          title: "Processing triggered",
          description: "All email sequences are now being processed",
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

  const handleCreateSchedule = async (interval: 'hourly' | 'daily' | 'every_6_hours') => {
    setIsProcessing(true);
    try {
      const success = await emailService.createProcessingSchedule(interval);
      
      if (success) {
        toast({
          title: "Schedule created",
          description: `Email sequences will now be processed ${interval.replace('_', ' ')}`,
        });
      } else {
        toast({
          title: "Scheduling failed",
          description: "Could not create processing schedule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast({
        title: "Scheduling error",
        description: "An error occurred while creating the schedule",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isProcessing}
        >
          <Clock className="mr-2 h-4 w-4" />
          Manage Processing
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleProcess} disabled={isProcessing}>
          <Play className="mr-2 h-4 w-4" />
          Process Now
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleCreateSchedule('hourly')} disabled={isProcessing}>
          Schedule Hourly
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCreateSchedule('every_6_hours')} disabled={isProcessing}>
          Schedule Every 6 Hours
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCreateSchedule('daily')} disabled={isProcessing}>
          Schedule Daily
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
