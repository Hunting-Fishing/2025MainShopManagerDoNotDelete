
import { useSequenceCRUD } from './sequence/useSequenceCRUD';
import { useSequenceAnalytics } from './sequence/useSequenceAnalytics';
import { useSequenceEnrollments } from './sequence/useSequenceEnrollments';
import { EmailSequence, EmailSequenceStep } from '@/types/email';

export const useEmailSequences = () => {
  const {
    sequences,
    currentSequence,
    loading,
    sequenceLoading,
    fetchSequences,
    fetchSequenceById,
    createSequence,
    updateSequence,
    deleteSequence,
    setCurrentSequence
  } = useSequenceCRUD();

  const {
    analytics,
    analyticsLoading,
    fetchSequenceAnalytics,
    setAnalytics
  } = useSequenceAnalytics();

  const {
    enrollments,
    loading: enrollmentsLoading,
    fetchCustomerEnrollments,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment
  } = useSequenceEnrollments();

  // Custom function to enroll customer - would be implemented in a real application
  const enrollCustomer = async (sequenceId: string, customerId: string) => {
    // This would be implemented in a real application
    return false;
  };

  return {
    // Sequence CRUD operations
    sequences,
    currentSequence,
    loading,
    sequenceLoading,
    fetchSequences,
    fetchSequenceById,
    createSequence,
    updateSequence,
    deleteSequence,
    setCurrentSequence,
    
    // Analytics operations
    analytics,
    analyticsLoading,
    fetchSequenceAnalytics,
    setAnalytics,
    
    // Enrollment operations
    enrollments,
    enrollmentsLoading,
    fetchCustomerEnrollments,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
    enrollCustomer
  };
};
