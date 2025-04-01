
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { sequenceProcessingService } from '@/services/email/sequences/sequenceProcessingService';
import { useToast } from '@/hooks/use-toast';
import { Play, Loader2, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function ManageSequenceProcessingButton() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    healthy?: boolean;
    timestamp?: string;
    error?: string;
  }>({});
  const { toast } = useToast();

  const checkHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await sequenceProcessingService.checkProcessingHealth();
      
      if (error) {
        throw error;
      }
      
      setHealthStatus(data);
      
      toast({
        title: data.healthy ? 'System Healthy' : 'System Unhealthy',
        description: data.healthy 
          ? `Last check: ${new Date(data.timestamp).toLocaleString()}` 
          : `Error: ${data.error || 'Unknown issue'}`,
        variant: data.healthy ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error('Error checking health:', error);
      setHealthStatus({ healthy: false, error: error instanceof Error ? error.message : 'Unknown error' });
      
      toast({
        title: 'Error Checking Health',
        description: error instanceof Error ? error.message : 'Failed to check system health',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerProcessing = async () => {
    setLoading(true);
    setConfirmOpen(false);
    
    try {
      const { data, error } = await sequenceProcessingService.triggerSequenceProcessing({ 
        force: true 
      });
      
      if (error) {
        throw error;
      }
      
      const { processed = 0, completed = 0 } = data || {};
      
      toast({
        title: 'Processing Triggered',
        description: `Successfully processed ${processed} enrollments (${completed} completed)`,
      });
    } catch (error) {
      console.error('Error triggering processing:', error);
      
      toast({
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : 'Failed to trigger email sequence processing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Settings2 className="mr-2 h-4 w-4" />
        )}
        Manage Processing
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Email Sequence Processing</DialogTitle>
            <DialogDescription>
              Manage and trigger the email sequence processing system.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">System Status</h3>
              <div className="flex items-center space-x-2">
                {healthStatus.healthy !== undefined ? (
                  <Badge variant={healthStatus.healthy ? "success" : "destructive"} className={healthStatus.healthy ? "bg-green-500" : ""}>
                    {healthStatus.healthy ? 'Healthy' : 'Unhealthy'}
                  </Badge>
                ) : (
                  <Badge variant="outline">Unknown</Badge>
                )}
                {healthStatus.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
              {healthStatus.error && (
                <p className="text-xs text-red-500">{healthStatus.error}</p>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">System Actions</h3>
              <p className="text-sm text-muted-foreground">
                These actions affect all active email sequences.
              </p>
            </div>
          </div>

          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={checkHealth}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Check Health
            </Button>
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Trigger Processing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process All Sequences</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately process all active email sequences, potentially sending emails to enrolled customers.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={triggerProcessing}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
