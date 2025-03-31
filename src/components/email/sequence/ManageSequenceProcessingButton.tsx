
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emailService } from '@/services/email';
import { useToast } from '@/hooks/use-toast';

interface ManageSequenceProcessingButtonProps {
  sequenceId?: string;
}

export function ManageSequenceProcessingButton({ sequenceId }: ManageSequenceProcessingButtonProps) {
  const [open, setOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const { toast } = useToast();

  const handleTriggerNow = async () => {
    setProcessing(true);
    try {
      // If we have a specific sequence ID, process just that sequence
      const result = await emailService.triggerSequenceProcessing(sequenceId);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Email sequence processing has been triggered',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to trigger email sequence processing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error triggering sequence processing:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while triggering sequence processing',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const schedule = {
        cron: frequency === 'hourly' ? '0 * * * *' : frequency === 'daily' ? '0 0 * * *' : '0 0 * * 1',
        enabled: enabled,
        sequenceIds: sequenceId ? [sequenceId] : undefined
      };
      
      const result = await emailService.createProcessingSchedule(schedule);
      
      if (result) {
        toast({
          title: 'Success',
          description: 'Email sequence processing schedule has been saved',
        });
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save email sequence processing schedule',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving processing schedule:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while saving the processing schedule',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Settings className="mr-2 h-4 w-4" />
        Manage Processing
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Sequence Processing</DialogTitle>
            <DialogDescription>
              Configure automatic processing for email sequences
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="run-now" className="font-medium">Run Processing Now</Label>
                <p className="text-sm text-muted-foreground">
                  Triggers email sequence processing immediately
                </p>
              </div>
              <Button 
                id="run-now" 
                onClick={handleTriggerNow}
                disabled={processing}
              >
                <Play className="mr-2 h-4 w-4" />
                Run Now
              </Button>
            </div>
            
            <div className="border-t pt-4 mt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="auto-process" className="font-medium">Automatic Processing</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable scheduled processing
                  </p>
                </div>
                <Switch 
                  id="auto-process" 
                  checked={enabled} 
                  onCheckedChange={setEnabled} 
                />
              </div>
              
              {enabled && (
                <div className="mt-4">
                  <Label htmlFor="frequency">Processing Frequency</Label>
                  <Select 
                    value={frequency} 
                    onValueChange={setFrequency}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
