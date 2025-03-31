
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ClockIcon, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { schedulingService } from '@/services/email';
import type { SequenceProcessingSchedule } from '@/services/email/scheduling/schedulingService';

interface ManageSequenceProcessingButtonProps {
  className?: string;
}

export function ManageSequenceProcessingButton({ className }: ManageSequenceProcessingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [schedule, setSchedule] = useState<SequenceProcessingSchedule>({
    enabled: false,
    cron: '0 * * * *',
    sequence_ids: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const { data, error } = await schedulingService.getSequenceProcessingSchedule();
      
      if (error) throw error;
      
      setSchedule(data || { enabled: false, cron: '0 * * * *', sequence_ids: [] });
    } catch (error) {
      console.error("Error loading processing schedule:", error);
      toast({
        title: "Loading error",
        description: "Failed to load sequence processing schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    setLoading(true);
    try {
      const { error } = await schedulingService.updateSequenceProcessingSchedule(schedule);
      
      if (error) throw error;
      
      toast({
        title: "Schedule updated",
        description: schedule.enabled 
          ? "Automatic sequence processing has been enabled" 
          : "Automatic sequence processing has been disabled",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving processing schedule:", error);
      toast({
        title: "Save error",
        description: "Failed to update sequence processing schedule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSchedule();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <ClockIcon className="h-4 w-4 mr-2" />
          Schedule Processing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sequence Processing Schedule
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-processing">Automatic Processing</Label>
              <div className="text-sm text-muted-foreground">
                Enable automatic processing of email sequences
              </div>
            </div>
            <Switch
              id="auto-processing"
              checked={schedule.enabled}
              onCheckedChange={(checked) => setSchedule({ ...schedule, enabled: checked })}
              disabled={loading}
            />
          </div>
          
          {schedule.enabled && (
            <div className="space-y-2">
              <Label htmlFor="cron-schedule">Processing Schedule (Cron)</Label>
              <Input
                id="cron-schedule"
                value={schedule.cron}
                onChange={(e) => setSchedule({ ...schedule, cron: e.target.value })}
                placeholder="0 * * * *"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Enter a cron expression to define when sequences should be processed.
                Default: Every hour (0 * * * *)
              </p>
            </div>
          )}
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={saveSchedule}
              disabled={loading}
            >
              Save Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
