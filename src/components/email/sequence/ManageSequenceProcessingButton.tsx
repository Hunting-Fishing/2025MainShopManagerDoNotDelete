
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { emailService } from '@/services/email';
import { Settings } from 'lucide-react';

export function ManageSequenceProcessingButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [cronExpression, setCronExpression] = useState('*/30 * * * *');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSchedule = async () => {
      setIsLoading(true);
      try {
        const schedule = await emailService.getSequenceProcessingSchedule();
        setIsEnabled(schedule.enabled);
        setCronExpression(schedule.cron || '*/30 * * * *');
      } catch (error) {
        console.error('Error fetching sequence processing schedule:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sequence processing settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isDialogOpen) {
      fetchSchedule();
    }
  }, [isDialogOpen, toast]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const success = await emailService.updateSequenceProcessingSchedule({
        enabled: isEnabled,
        cron: cronExpression
      });

      if (success) {
        toast({
          title: 'Success',
          description: `Sequence processing ${isEnabled ? 'enabled' : 'disabled'} successfully`,
        });
        setIsDialogOpen(false);
      } else {
        throw new Error('Failed to update sequence processing schedule');
      }
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update sequence processing settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
      >
        <Settings className="mr-2 h-4 w-4" />
        Sequence Processing
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Sequence Processing</DialogTitle>
            <DialogDescription>
              Configure how frequently email sequences are processed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-processing">Enable automatic processing</Label>
              <Switch
                id="enable-processing"
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cron-expression">Schedule (cron expression)</Label>
              <Input
                id="cron-expression"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                placeholder="*/30 * * * *"
              />
              <p className="text-sm text-muted-foreground">
                Default: every 30 minutes (*/30 * * * *)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
