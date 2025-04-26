
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
      >
        Cancel
      </Button>
      <Button 
        variant="esm"
        onClick={onSubmit}
        disabled={disabled}
      >
        Create
      </Button>
    </div>
  );
};
