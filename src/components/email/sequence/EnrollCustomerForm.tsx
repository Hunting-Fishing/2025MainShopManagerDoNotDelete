
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
  GanttChart
} from 'lucide-react';
import { useEnrollCustomerForm } from './hooks/useEnrollCustomerForm';

interface EnrollCustomerFormProps {
  customerId: string;
  onEnroll?: (enrollmentId: string) => void;
}

export const EnrollCustomerForm: React.FC<EnrollCustomerFormProps> = ({
  customerId,
  onEnroll
}) => {
  const [open, setOpen] = useState(false);
  const {
    selectedSequence,
    selectedCustomer,
    loading,
    handleSequenceSelect,
    handleCustomerSelect,
    enrollCustomerInSequence
  } = useEnrollCustomerForm({
    onSuccess: () => {
      setOpen(false);
      if (onEnroll && selectedSequence) {
        onEnroll(selectedSequence.id);
      }
    }
  });

  const handleSubmit = async () => {
    await enrollCustomerInSequence();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <GanttChart className="mr-2 h-4 w-4" /> Enroll in Sequence
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enroll Customer in Email Sequence</DialogTitle>
          <DialogDescription>
            Select a sequence to enroll this customer in.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center py-8 text-slate-500">
            Sequence selection coming soon
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || !selectedSequence}>
            {loading ? 'Enrolling...' : 'Enroll Customer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
