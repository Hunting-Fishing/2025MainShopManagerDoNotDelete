
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
        const parsedService = JSON.parse(savedService);
        setSelectedService(parsedService);
      } catch (error) {
        console.error('Error parsing saved service:', error);
        localStorage.removeItem('selectedWorkOrderService');
      }
    }
  }, []);

  const selectService = (service: WorkOrderService) => {
    // Save to localStorage for persistence
    localStorage.setItem('selectedWorkOrderService', JSON.stringify(service));
    setSelectedService(service);
  };

  const clearSelectedService = () => {
    localStorage.removeItem('selectedWorkOrderService');
    setSelectedService(null);
  };

  return {
    selectedService,
    selectService,
    clearSelectedService
  };
}
