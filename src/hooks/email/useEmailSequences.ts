
import { useEffect } from "react";
import { useSequenceCRUD } from "./sequence/useSequenceCRUD";
import { useSequenceAnalytics } from "./sequence/useSequenceAnalytics";
import { useSequenceEnrollments } from "./sequence/useSequenceEnrollments";
import { UseSequencesReturn } from "./sequence/types";

export const useEmailSequences = (): UseSequencesReturn => {
  const {
    sequences,
    currentSequence,
    loading,
    sequenceLoading,
    fetchSequences,
    fetchSequenceById,
    createSequence,
    updateSequence,
    deleteSequence
  } = useSequenceCRUD();

  const {
    analytics,
    analyticsLoading,
    fetchSequenceAnalytics
  } = useSequenceAnalytics();

  const {
    enrollments,
    enrollmentsLoading,
    fetchCustomerEnrollments,
    enrollCustomer,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment
  } = useSequenceEnrollments();

  useEffect(() => {
    fetchSequences();
  }, []);

  useEffect(() => {
    if (currentSequence) {
      fetchSequenceAnalytics(currentSequence.id);
    }
  }, [currentSequence]);

  return {
    // State
    sequences,
    currentSequence,
    analytics,
    enrollments,
    
    // Loading states
    loading,
    sequenceLoading,
    analyticsLoading,
    enrollmentsLoading,
    
    // CRUD operations
    fetchSequences,
    fetchSequenceById,
    fetchSequenceAnalytics,
    fetchCustomerEnrollments,
    createSequence,
    updateSequence,
    deleteSequence,
    
    // Enrollment operations
    enrollCustomer,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment
  };
};
