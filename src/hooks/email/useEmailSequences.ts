
import { useSequenceCRUD } from './sequence/useSequenceCRUD';
import { useSequenceAnalytics } from './sequence/useSequenceAnalytics';
import { useSequenceEnrollments } from './sequence/useSequenceEnrollments';
import { EmailSequence, EmailSequenceStep, EmailSequenceEnrollment } from '@/types/email';

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
    loading: analyticsLoading,
    error: analyticsError,
    fetchAnalytics
  } = useSequenceAnalytics();

  // Create a compatible fetchSequenceAnalytics function that matches expected usage
  const fetchSequenceAnalytics = async (sequenceId?: string) => {
    return await fetchAnalytics();
  };

  const {
    enrollments,
    loading: enrollmentsLoading,
    fetchCustomerEnrollments,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
    enrollCustomer
  } = useSequenceEnrollments();

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
    analyticsError,
    fetchSequenceAnalytics,
    
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
