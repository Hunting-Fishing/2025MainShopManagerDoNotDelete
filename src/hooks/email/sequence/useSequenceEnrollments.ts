
import { useState } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailSequenceEnrollment } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export const useSequenceEnrollments = () => {
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCustomerEnrollments = async (customerId: string) => {
    setEnrollmentsLoading(true);
    try {
      const data = await emailService.getCustomerEnrollments(customerId);
      const transformedEnrollments: EmailSequenceEnrollment[] = data.map(enrollment => ({
        id: enrollment.id,
        sequenceId: enrollment.sequence_id,
        customerId: enrollment.customer_id,
        currentStepId: enrollment.current_step_id,
        status: enrollment.status as 'active' | 'completed' | 'paused' | 'cancelled',
        startedAt: enrollment.started_at,
        completedAt: enrollment.completed_at || undefined,
        nextSendTime: enrollment.next_send_time || undefined,
        metadata: (enrollment.metadata as Record<string, any>) || {}
      }));
      setEnrollments(transformedEnrollments);
      return transformedEnrollments;
    } catch (error) {
      console.error("Error fetching customer enrollments:", error);
      toast({
        title: "Error",
        description: "Failed to load customer enrollments",
        variant: "destructive",
      });
      return [];
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const enrollCustomer = async (sequenceId: string, customerId: string) => {
    try {
      const success = await emailService.enrollCustomerInSequence(sequenceId, customerId);
      if (success) {
        toast({
          title: "Success",
          description: "Customer enrolled in sequence successfully",
        });
      }
      return success;
    } catch (error) {
      console.error("Error enrolling customer in sequence:", error);
      toast({
        title: "Error",
        description: "Failed to enroll customer in sequence",
        variant: "destructive",
      });
      return false;
    }
  };

  const pauseEnrollment = async (enrollmentId: string) => {
    try {
      const success = await emailService.pauseCustomerEnrollment(enrollmentId);
      if (success) {
        toast({
          title: "Success",
          description: "Enrollment paused successfully",
        });
        setEnrollments(prev => 
          prev.map(e => e.id === enrollmentId ? { ...e, status: 'paused' } : e)
        );
      }
      return success;
    } catch (error) {
      console.error("Error pausing enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to pause enrollment",
        variant: "destructive",
      });
      return false;
    }
  };

  const resumeEnrollment = async (enrollmentId: string) => {
    try {
      const success = await emailService.resumeCustomerEnrollment(enrollmentId);
      if (success) {
        toast({
          title: "Success",
          description: "Enrollment resumed successfully",
        });
        setEnrollments(prev => 
          prev.map(e => e.id === enrollmentId ? { ...e, status: 'active' } : e)
        );
      }
      return success;
    } catch (error) {
      console.error("Error resuming enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to resume enrollment",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelEnrollment = async (enrollmentId: string) => {
    try {
      const success = await emailService.cancelCustomerEnrollment(enrollmentId);
      if (success) {
        toast({
          title: "Success",
          description: "Enrollment cancelled successfully",
        });
        setEnrollments(prev => 
          prev.map(e => e.id === enrollmentId ? { ...e, status: 'cancelled' } : e)
        );
      }
      return success;
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel enrollment",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    enrollments,
    enrollmentsLoading,
    fetchCustomerEnrollments,
    enrollCustomer,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
    setEnrollments
  };
};
