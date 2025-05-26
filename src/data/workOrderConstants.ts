
// Work Order Status Constants
export const WORK_ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Work Order Priority Constants
export const WORK_ORDER_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

// Default form values
export const DEFAULT_WORK_ORDER_VALUES = {
  customer: "",
  description: "",
  status: "pending",
  priority: "medium",
  technician: "",
  location: "",
  dueDate: "",
  notes: "",
  vehicleMake: "",
  vehicleModel: "",
  vehicleYear: "",
  odometer: "",
  licensePlate: "",
  vin: "",
  inventoryItems: []
};
