
import { Button } from '@/components/ui/button';

interface DialogActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  disabled: boolean;
}

export const DialogActions = ({ onClose, onSubmit, disabled }: DialogActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        onClick={onClose} 
        className="bg-white hover:bg-gray-50"  // Explicitly set solid background
      >
        Cancel
      </Button>
      <Button 
        onClick={onSubmit} 
        disabled={disabled}
        className="bg-primary hover:bg-primary-foreground"  // Ensure solid background
      >
        Create
      </Button>
    </div>
  );
};
