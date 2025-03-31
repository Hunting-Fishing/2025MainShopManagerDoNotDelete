
import { useEnrollmentState } from './enrollments/useEnrollmentState';
import { useFetchEnrollments } from './enrollments/useFetchEnrollments';
import { useEnrollmentActions } from './enrollments/useEnrollmentActions';
import { useEnrollCustomer } from './enrollments/useEnrollCustomer';

export const useSequenceEnrollments = () => {
  const { enrollments, setEnrollments, loading, setLoading } = useEnrollmentState();
  
  const { fetchCustomerEnrollments } = useFetchEnrollments(
    setEnrollments,
    setLoading
  );
  
  const { pauseEnrollment, resumeEnrollment, cancelEnrollment } = useEnrollmentActions(
    setEnrollments
  );
  
  const { enrollCustomer } = useEnrollCustomer(fetchCustomerEnrollments);

  return {
    enrollments,
    loading,
    fetchCustomerEnrollments,
    pauseEnrollment,
    resumeEnrollment,
    cancelEnrollment,
    enrollCustomer
  };
};
