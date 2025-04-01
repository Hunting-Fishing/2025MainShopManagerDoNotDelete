
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
    fetchAnalytics: fetchSequenceAnalytics,
    setAnalytics
  } = useSequenceAnalytics();

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
