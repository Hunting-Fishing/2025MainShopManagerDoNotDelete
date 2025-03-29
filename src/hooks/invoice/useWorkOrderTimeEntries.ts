
import { WorkOrder } from "@/types/invoice";
import { formatTimeInHoursAndMinutes } from "@/data/workOrdersData";
import { v4 as uuidv4 } from "uuid";

export function useWorkOrderTimeEntries() {
  // Custom handler to add time entries from work order to invoice items
  const addTimeEntriesToInvoiceItems = (workOrder: WorkOrder, currentItems: any[] = []) => {
    // Return early if no time entries
    if (!workOrder.timeEntries || workOrder.timeEntries.length === 0) {
      return currentItems;
    }
    
    // Get billable entries and group by employee
    const billableEntries = workOrder.timeEntries.filter(entry => entry.billable);
    
    if (billableEntries.length === 0) {
      return currentItems;
    }
    
    // Group entries by employee
    const employeeTimeMap: Record<string, number> = {};
    
    billableEntries.forEach(entry => {
      if (!employeeTimeMap[entry.employeeName]) {
        employeeTimeMap[entry.employeeName] = 0;
      }
      employeeTimeMap[entry.employeeName] += entry.duration;
    });
    
    // Create labor items for each employee
    const laborItems = Object.entries(employeeTimeMap).map(([employee, minutes]) => {
      // Convert minutes to hours for billing
      const hours = minutes / 60;
      
      // Standard labor rate of $75/hour
      const laborRate = 75;
      
      // Create labor item
      return {
        id: uuidv4(),
        name: `Labor - ${employee}`,
        description: `Service labor (${formatTimeInHoursAndMinutes(minutes)})`,
        quantity: parseFloat(hours.toFixed(2)),
        price: laborRate,
        total: parseFloat((hours * laborRate).toFixed(2)),
        hours: true
      };
    });
    
    // Return combined items array
    return [...currentItems, ...laborItems];
  };

  return {
    addTimeEntriesToInvoiceItems
  };
}
