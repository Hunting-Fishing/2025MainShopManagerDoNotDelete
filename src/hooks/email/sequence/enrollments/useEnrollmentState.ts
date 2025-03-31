
import { useState } from 'react';
import { EmailSequenceEnrollment } from '@/types/email';

export const useEnrollmentState = () => {
  const [enrollments, setEnrollments] = useState<EmailSequenceEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  
  return {
    enrollments,
    setEnrollments,
    loading,
    setLoading
  };
};
