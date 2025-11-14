import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowRight } from 'lucide-react';

interface ConvertToWorkOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onSuccess: () => void;
}

interface Technician {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  job_title?: string;
}

export function ConvertToWorkOrderDialog({ 
  open, 
  onOpenChange, 
  request, 
  onSuccess 
}: ConvertToWorkOrderDialogProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTechs, setLoadingTechs] = useState(true);

  useEffect(() => {
    if (open) {
      fetchTechnicians();
    }
  }, [open]);

  const fetchTechnicians = async () => {
    try {
      setLoadingTechs(true);
      
      // Get current user's shop_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const profileResult: any = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      const profile = profileResult.data;
      if (!profile?.shop_id) throw new Error('No shop found');

      // Fetch all staff except office roles from the same shop
      const techResult: any = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, job_title')
        .eq('shop_id', profile.shop_id)
        .not('job_title', 'is', null);

      if (techResult.error) throw techResult.error;
      
      // Office roles to exclude
      const officeRoles = [
        'office manager',
        'administrative assistant',
        'receptionist',
        'secretary',
        'office assistant',
        'admin',
        'office',
        'administrator'
      ];
      
      // Filter out office roles
      const filteredTechs = (techResult.data || []).filter((t: any) => {
        const jobTitle = (t.job_title || '').toLowerCase();
        return !officeRoles.some(role => jobTitle.includes(role));
      });
      
      setTechnicians(filteredTechs);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Failed to load technicians');
    } finally {
      setLoadingTechs(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedTechnicianId) {
      toast.error('Please select a technician');
      return;
    }

    setLoading(true);
    try {
      // Get current user and shop_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', user.id)
        .single();

      if (!profile?.shop_id) throw new Error('No shop found');

      // Get selected technician details
      const selectedTech = technicians.find(t => t.id === selectedTechnicianId);
      const technicianFullName = selectedTech 
        ? `${selectedTech.first_name} ${selectedTech.last_name}`.trim()
        : '';

      // Create work order from maintenance request with all required fields
      const workOrderData = {
        shop_id: profile.shop_id,
        created_by: user.id,
        description: request.title,
        customer_name: request.requested_by_name || 'Equipment Maintenance',
        status: 'in-progress',
        priority: request.priority || 'medium',
        service_type: 'Maintenance',
        technician_id: selectedTechnicianId,
        assigned_to: selectedTechnicianId,
        assigned_to_name: technicianFullName,
        equipment_id: request.equipment_id,
        notes: `Converted from Maintenance Request #${request.request_number}\n\n${request.description || ''}\n\n${additionalNotes}`.trim(),
        scheduled_date: request.scheduled_date || new Date().toISOString(),
      };

      console.log('Creating work order with data:', workOrderData);

      const { data: workOrder, error: workOrderError } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (workOrderError) {
        console.error('Work order creation error:', workOrderError);
        throw new Error(`Database error: ${workOrderError.message}`);
      }

      console.log('Work order created successfully:', workOrder);

      // Update maintenance request status
      const { error: updateError } = await supabase
        .from('maintenance_requests')
        .update({ 
          status: 'in_progress',
          assigned_to: selectedTechnicianId,
          assigned_to_name: technicianFullName,
          notes: `Converted to Work Order. ${request.notes || ''}`.trim()
        })
        .eq('id', request.id);

      if (updateError) {
        console.error('Maintenance request update error:', updateError);
        // Don't fail the whole operation if update fails
        toast.error('Work order created but failed to update request status');
      }

      toast.success(`Work order created and assigned to ${technicianFullName}`);
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setSelectedTechnicianId('');
      setAdditionalNotes('');
    } catch (error: any) {
      console.error('Error converting to work order:', error);
      const errorMessage = error?.message || 'Failed to create work order';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Convert to Work Order
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Request Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div>
              <span className="text-sm font-medium">Request:</span>
              <p className="text-sm text-muted-foreground">{request?.title}</p>
            </div>
            {request?.description && (
              <div>
                <span className="text-sm font-medium">Description:</span>
                <p className="text-sm text-muted-foreground">{request.description}</p>
              </div>
            )}
            <div className="flex gap-4 text-xs">
              <span className="font-mono">#{request?.request_number}</span>
              <span className="capitalize">{request?.priority} priority</span>
            </div>
          </div>

          {/* Technician Selection */}
          <div className="space-y-2">
            <Label htmlFor="technician">Assign to Technician *</Label>
            {loadingTechs ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                <SelectTrigger id="technician">
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {`${tech.first_name} ${tech.last_name}`.trim()}
                      {tech.job_title && ` - ${tech.job_title}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Work Order Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional instructions or notes for the technician..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            <p className="font-medium mb-1">What happens next:</p>
            <ul className="text-xs space-y-1 list-disc list-inside">
              <li>A new work order will be created with all request details</li>
              <li>The assigned technician will be notified</li>
              <li>The maintenance request status will update to "In Progress"</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConvert} 
            disabled={loading || !selectedTechnicianId}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Work Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
