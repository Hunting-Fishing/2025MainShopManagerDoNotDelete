
import { useState, useEffect } from 'react';
import { WorkOrderTemplate } from '@/types/workOrder';
import { v4 as uuidv4 } from 'uuid';

// Mock templates data
const mockTemplates: WorkOrderTemplate[] = [
  {
    id: "template-1",
    name: "Standard Oil Change",
    description: "Regular oil change service with filter replacement",
    createdAt: "2023-03-15T10:30:00Z",
    lastUsed: "2023-05-10T14:20:00Z",
    usageCount: 42,
    status: "pending",
    priority: "medium",
    technician: "John Smith",
    notes: "Standard 5W-30 synthetic oil and OEM filter",
    inventoryItems: [
      { 
        id: "item-1", 
        name: "Synthetic Oil (1 quart)", 
        sku: "OIL-5W30", 
        category: "Fluids", 
        quantity: 5, 
        unitPrice: 9.99 
      },
      { 
        id: "item-2", 
        name: "Oil Filter", 
        sku: "FIL-1234", 
        category: "Filters", 
        quantity: 1, 
        unitPrice: 12.99 
      }
    ]
  },
  {
    id: "template-2",
    name: "Brake Service",
    description: "Front brake pad replacement",
    createdAt: "2023-02-20T09:15:00Z",
    lastUsed: "2023-05-05T11:45:00Z",
    usageCount: 28,
    status: "pending",
    priority: "high",
    technician: "Sarah Johnson",
    notes: "Inspect rotors and calipers during service",
    inventoryItems: [
      { 
        id: "item-3", 
        name: "Front Brake Pads", 
        sku: "BRK-2244", 
        category: "Brakes", 
        quantity: 1, 
        unitPrice: 89.99 
      },
      { 
        id: "item-4", 
        name: "Brake Cleaner", 
        sku: "CLE-5678", 
        category: "Chemicals", 
        quantity: 1, 
        unitPrice: 7.99 
      }
    ]
  }
];

export function useWorkOrderTemplates() {
  const [templates, setTemplates] = useState<WorkOrderTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Instead of querying Supabase, we'll use our mock data
      // This simulates a delay in data fetching
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTemplates(mockTemplates);
    } catch (err) {
      console.error('Error fetching work order templates:', err);
      setError('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplateUsage = async (templateId: string) => {
    try {
      // Update the last_used timestamp and increment the usage count in our local state
      setTemplates(prev => 
        prev.map(t => 
          t.id === templateId 
            ? { ...t, lastUsed: new Date().toISOString(), usageCount: t.usageCount + 1 }
            : t
        )
      );
    } catch (err) {
      console.error('Error updating template usage:', err);
    }
  };

  const createTemplate = async (template: Omit<WorkOrderTemplate, 'id' | 'createdAt' | 'usageCount'>) => {
    setIsLoading(true);
    try {
      // Create a new template object
      const newTemplate: WorkOrderTemplate = {
        ...template,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };
      
      // Add to local state
      setTemplates(prev => [...prev, newTemplate]);
      
      return {
        success: true,
        message: 'Template created successfully'
      };
    } catch (err) {
      console.error('Error creating template:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to create template'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { templates, isLoading, error, updateTemplateUsage, createTemplate, fetchTemplates };
}
