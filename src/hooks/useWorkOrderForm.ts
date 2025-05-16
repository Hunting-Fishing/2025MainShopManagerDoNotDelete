import { useState } from 'react';
import { WorkOrderInventoryItem } from '@/components/work-orders/inventory/WorkOrderInventoryItem'; 

// Keep imports and other code...

export function useWorkOrderForm() {
  // Original code before the inventory items section
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    customer: '',
    customer_id: '',
    technician: '',
    technician_id: '',
    due_date: new Date().toISOString().split('T')[0],
    notes: '',
    location: '',
    estimated_hours: 1,
    total_cost: 0
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showTechnicianDialog, setShowTechnicianDialog] = useState(false);
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);

  // Fix the typing for inventory items
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);

  // Update the function that adds inventory items
  const handleAddInventoryItem = (item: any) => {
    const newItem: WorkOrderInventoryItem = {
      id: item.id || crypto.randomUUID(),
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      quantity: item.quantity || 1,
      unit_price: item.unit_price || item.price || 0,
      total: (item.quantity || 1) * (item.unit_price || item.price || 0)
    };
    
    setInventoryItems(prev => [...prev, newItem]);
  };

  // Rest of the original code
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCustomerSelect = (customer) => {
    if (!customer) return;
    
    setFormData(prev => ({
      ...prev,
      customer: customer.name || `${customer.first_name} ${customer.last_name}`,
      customer_id: customer.id
    }));
    
    setShowCustomerDialog(false);
  };

  const handleTechnicianSelect = (technician) => {
    if (!technician) return;
    
    setFormData(prev => ({
      ...prev,
      technician: technician.name || `${technician.first_name} ${technician.last_name}`,
      technician_id: technician.id
    }));
    
    setShowTechnicianDialog(false);
  };

  const handleRemoveInventoryItem = (id) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateInventoryItemQuantity = (id, quantity) => {
    setInventoryItems(prev => 
      prev.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, quantity); // Ensure quantity is at least 1
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.unit_price
          };
        }
        return item;
      })
    );
  };

  const handleAddTimeEntry = (entry) => {
    setTimeEntries(prev => [...prev, {
      ...entry,
      id: crypto.randomUUID()
    }]);
  };

  const handleRemoveTimeEntry = (id) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleAddAttachment = (file) => {
    setAttachments(prev => [...prev, {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file
    }]);
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(prev => {
      const filtered = prev.filter(attachment => attachment.id !== id);
      // Revoke object URL to prevent memory leaks
      const removed = prev.find(attachment => attachment.id === id);
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      return filtered;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (!formData.customer_id) {
      newErrors.customer = "Customer is required";
    }
    
    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate total cost from inventory items and time entries
      const inventoryCost = inventoryItems.reduce((sum, item) => sum + item.total, 0);
      
      // Prepare work order data
      const workOrderData = {
        ...formData,
        inventory_items: inventoryItems,
        time_entries: timeEntries,
        attachments: attachments.map(({ file, ...rest }) => rest), // Remove file object
        total_cost: inventoryCost
      };
      
      // Here you would typically save to your database
      console.log("Submitting work order:", workOrderData);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add activity
      const newActivity = {
        id: crypto.randomUUID(),
        type: 'create',
        message: 'Work order created',
        timestamp: new Date().toISOString(),
        user: 'Current User'
      };
      
      setActivities(prev => [newActivity, ...prev]);
      
      // Reset form or redirect
      // resetForm();
      
    } catch (error) {
      console.error("Error submitting work order:", error);
      setErrors(prev => ({
        ...prev,
        submit: "Failed to submit work order. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      customer: '',
      customer_id: '',
      technician: '',
      technician_id: '',
      due_date: new Date().toISOString().split('T')[0],
      notes: '',
      location: '',
      estimated_hours: 1,
      total_cost: 0
    });
    setInventoryItems([]);
    setTimeEntries([]);
    setAttachments([]);
    setErrors({});
  };
  
  return {
    formData,
    errors,
    isSubmitting,
    inventoryItems,
    timeEntries,
    attachments,
    activities,
    showCustomerDialog,
    showTechnicianDialog,
    showInventoryDialog,
    setFormData,
    setShowCustomerDialog,
    setShowTechnicianDialog,
    setShowInventoryDialog,
    handleInputChange,
    handleCustomerSelect,
    handleTechnicianSelect,
    handleAddInventoryItem,
    handleRemoveInventoryItem,
    handleUpdateInventoryItemQuantity,
    handleAddTimeEntry,
    handleRemoveTimeEntry,
    handleAddAttachment,
    handleRemoveAttachment,
    handleSubmit,
    resetForm
  };
}
