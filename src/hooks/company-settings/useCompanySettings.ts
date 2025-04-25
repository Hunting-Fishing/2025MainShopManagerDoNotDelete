
import { useState, useEffect } from 'react';
import { useBusinessConstants } from '@/hooks/useBusinessConstants';

export const useCompanySettings = () => {
  const {
    businessTypeOptions,
    industryOptions, 
    paymentMethodOptions,
    loading,
    error
  } = useBusinessConstants();

  return {
    businessTypeOptions,
    industryOptions,
    paymentMethodOptions,
    loading,
    error
  };
};
