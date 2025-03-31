import { useState } from 'react';
import { EmailSequenceEnrollment } from '@/types/email';
import { emailService } from '@/services/email/emailService';
import { useToast } from '@/hooks/use-toast';

export function useSequenceEnrollments() {
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomerEnrollments = async (customerId: string): Promise<EmailSequenceEnrollment[]> => {
    setLoading(true);
    try {
      const data = await emailService.getCustomerSequenceEnrollments(customerId);
      
      // Map the data to match the EmailSequenceEnrollment interface
      const mappedEnrollments: EmailSequenceEnrollment[] = data.map((item: any) => ({
        id: item.id,
        sequence_id: item.sequenceId,
        customer_id: item.customerId,
        status: item.status as "active" | "paused" | "completed" | "cancelled",
        current_step_id: item.currentStepId,
        created_at: item.startedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: item.completedAt,
        // Keep additional properties
        sequenceId: item.sequenceId,
        customerId: item.customerId,
        currentStepId: item.currentStepId,
        startedAt: item.startedAt,
        completedAt: item.completedAt,
        nextSendTime: item.nextSendTime,
        metadata: item.metadata
      }));
      
      setEnrollments(mappedEnrollments);
      return mappedEnrollments;
    } catch (error) {
      console.error("Error fetching customer enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch customer enrollments",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const pauseEnrollment = async (enrollmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await emailService.pauseSequenceEnrollment(enrollmentId);
      
      if (success) {
        // Update local state
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'paused' } 
              : enrollment
          )
        );
        
        toast({
          title: "Enrollment Paused",
          description: "The sequence enrollment has been paused successfully",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error pausing enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to pause the enrollment",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resumeEnrollment = async (enrollmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await emailService.resumeSequenceEnrollment(enrollmentId);
      
      if (success) {
        // Update local state
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'active' } 
              : enrollment
          )
        );
        
        toast({
          title: "Enrollment Resumed",
          description: "The sequence enrollment has been resumed successfully",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error resuming enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to resume the enrollment",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelEnrollment = async (enrollmentId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await emailService.cancelSequenceEnrollment(enrollmentId);
      
      if (success) {
        // Update local state
        setEnrollments(prev => 
          prev.map(enrollment => 
            enrollment.id === enrollmentId 
              ? { ...enrollment, status: 'cancelled' } 
              : enrollment
          )
        );
        
        toast({
          title: "Enrollment Cancelled",
          description: "The sequence enrollment has been cancelled successfully",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the enrollment",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    enrollments,
    loading,
    fetchCustomerEnrollments,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
  };
}
