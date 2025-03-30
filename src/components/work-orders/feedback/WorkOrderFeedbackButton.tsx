
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { getFeedbackForms } from '@/services/feedbackService';
import { MessageSquare } from 'lucide-react';

interface WorkOrderFeedbackButtonProps {
  workOrderId: string;
  customerId: string;
}

export const WorkOrderFeedbackButton: React.FC<WorkOrderFeedbackButtonProps> = ({
  workOrderId,
  customerId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackFormId, setFeedbackFormId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Temporary shop ID (in a real app, this would come from context or auth)
  const shopId = 'DEFAULT-SHOP-ID';

  useEffect(() => {
    const loadFeedbackForms = async () => {
      setLoading(true);
      const forms = await getFeedbackForms(shopId);
      
      // Find the first active feedback form
      const activeForm = forms.find(form => form.is_active);
      if (activeForm) {
        setFeedbackFormId(activeForm.id);
      }
      
      setLoading(false);
    };
    
    loadFeedbackForms();
  }, [shopId]);

  const handleFeedbackComplete = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        disabled={loading || !feedbackFormId}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Request Feedback
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Feedback</DialogTitle>
          </DialogHeader>
          
          {feedbackFormId && (
            <FeedbackForm 
              formId={feedbackFormId}
              customerId={customerId}
              workOrderId={workOrderId}
              onComplete={handleFeedbackComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
