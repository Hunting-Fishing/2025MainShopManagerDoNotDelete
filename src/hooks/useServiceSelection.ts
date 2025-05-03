
import { useState, useEffect } from 'react';

interface WorkOrderService {
  mainCategory: string;
  subcategory: string;
  job: string;
  estimatedTime?: number;
}

export function useServiceSelection() {
  const [selectedService, setSelectedService] = useState<WorkOrderService | null>(null);

  useEffect(() => {
    // When the component mounts, check if there's a selected service
    const savedService = localStorage.getItem('selectedWorkOrderService');
    if (savedService) {
      try {
        setSelectedService(JSON.parse(savedService));
      } catch (error) {
        console.error('Error parsing saved service:', error);
        localStorage.removeItem('selectedWorkOrderService');
      }
    }
  }, []);

  const clearSelectedService = () => {
    localStorage.removeItem('selectedWorkOrderService');
    setSelectedService(null);
  };

  return {
    selectedService,
    clearSelectedService
  };
}
