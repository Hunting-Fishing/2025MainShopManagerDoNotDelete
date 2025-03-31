import { useState, useEffect } from "react";
import { emailService } from "@/services/email/emailService";
import { EmailSequence, EmailSequenceStep, EmailSequenceEnrollment, EmailSequenceAnalytics } from "@/types/email";
import { useToast } from "@/hooks/use-toast";

export const useEmailSequences = () => {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [currentSequence, setCurrentSequence] = useState<EmailSequence | null>(null);
  const [analytics, setAnalytics] = useState<EmailSequenceAnalytics | null>(null);
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [sequenceLoading, setSequenceLoading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSequences();
  }, []);

  useEffect(() => {
    if (currentSequence) {
      fetchSequenceAnalytics(currentSequence.id);
    }
  }, [currentSequence]);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const data = await emailService.getSequences();
      setSequences(data);
    } catch (error) {
      console.error("Error fetching email sequences:", error);
      toast({
        title: "Error",
        description: "Failed to load email sequences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSequenceById = async (id: string) => {
    setSequenceLoading(true);
    try {
      const sequence = await emailService.getSequenceById(id);
      setCurrentSequence(sequence);
      return sequence;
    } catch (error) {
      console.error("Error fetching email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to load email sequence",
        variant: "destructive",
      });
      return null;
    } finally {
      setSequenceLoading(false);
    }
  };

  const fetchSequenceAnalytics = async (sequenceId: string) => {
    setAnalyticsLoading(true);
    try {
      const data = await emailService.getSequenceAnalytics(sequenceId);
      if (data) {
        const transformedData: EmailSequenceAnalytics = {
          id: data.id || "",
          sequenceId: data.sequence_id,
          totalEnrollments: data.total_enrollments,
          activeEnrollments: data.active_enrollments,
          completedEnrollments: data.completed_enrollments,
          conversionRate: data.conversion_rate || 0,
          averageTimeToComplete: data.average_time_to_complete || 0,
          updatedAt: data.updated_at
        };
        setAnalytics(transformedData);
        return transformedData;
      }
      return null;
    } catch (error) {
      console.error("Error fetching sequence analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load sequence analytics",
        variant: "destructive",
      });
      return null;
    } finally {
      setAnalyticsLoading(false);
    }
  };

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
        metadata: enrollment.metadata as Record<string, any> || {}
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

  const createSequence = async (sequence: Partial<EmailSequence>) => {
    try {
      const newSequence = await emailService.createSequence(sequence);
      if (newSequence) {
        setSequences((prev) => [newSequence, ...prev]);
        toast({
          title: "Success",
          description: "Email sequence created successfully",
        });
      }
      return newSequence;
    } catch (error) {
      console.error("Error creating email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to create email sequence",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateSequence = async (id: string, sequence: Partial<EmailSequence>) => {
    try {
      const updatedSequence = await emailService.updateSequence(id, sequence);
      if (updatedSequence) {
        setSequences((prev) => 
          prev.map((s) => s.id === id ? updatedSequence : s)
        );
        if (currentSequence && currentSequence.id === id) {
          setCurrentSequence(updatedSequence);
        }
        toast({
          title: "Success",
          description: "Email sequence updated successfully",
        });
      }
      return updatedSequence;
    } catch (error) {
      console.error("Error updating email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to update email sequence",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteSequence = async (id: string) => {
    try {
      await emailService.deleteSequence(id);
      setSequences((prev) => prev.filter((s) => s.id !== id));
      if (currentSequence && currentSequence.id === id) {
        setCurrentSequence(null);
      }
      toast({
        title: "Success",
        description: "Email sequence deleted successfully",
      });
      return true;
    } catch (error) {
      console.error("Error deleting email sequence:", error);
      toast({
        title: "Error",
        description: "Failed to delete email sequence",
        variant: "destructive",
      });
      return false;
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
        if (currentSequence && currentSequence.id === sequenceId) {
          fetchSequenceAnalytics(sequenceId);
        }
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
    sequences,
    currentSequence,
    analytics,
    enrollments,
    loading,
    sequenceLoading,
    analyticsLoading,
    enrollmentsLoading,
    fetchSequences,
    fetchSequenceById,
    fetchSequenceAnalytics,
    fetchCustomerEnrollments,
    createSequence,
    updateSequence,
    deleteSequence,
    enrollCustomer,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment
  };
};
