
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
        className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"  // Enhanced solid background
      >
        Cancel
      </Button>
      <Button 
        onClick={onSubmit} 
        disabled={disabled}
        className="bg-esm-blue-600 hover:bg-esm-blue-700 text-white"  // Using solid brand color
      >
        Create
      </Button>
    </div>
  );
};
