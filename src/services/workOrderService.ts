
// Mock data until real data source is connected
export const getWorkOrderStatusCounts = async () => {
  try {
    // In a real implementation, this would fetch data from an API or database
    // For now, return mock data to simulate the API response
    return {
      pending: 18,
      inProgress: 28,
      completed: 45,
      cancelled: 9
    };
    
    // When connecting to a real API, it would look something like:
    // const response = await fetch('/api/work-orders/status-counts');
    // return await response.json();
  } catch (error) {
    console.error("Error fetching work order status counts:", error);
    throw error;
  }
};

export const getRecentWorkOrders = async (limit = 5) => {
  try {
    // Mock data for recent work orders
    return [
      {
        id: "WO-2023-001",
        customer: "John Smith",
        service: "HVAC Repair",
        status: "In Progress",
        date: "2023-04-01",
        priority: "High"
      },
      {
        id: "WO-2023-002",
        customer: "Sarah Johnson",
        service: "Plumbing Installation",
        status: "Completed",
        date: "2023-03-28",
        priority: "Medium"
      },
      {
        id: "WO-2023-003",
        customer: "Michael Brown",
        service: "Electrical Inspection",
        status: "Pending",
        date: "2023-04-05",
        priority: "Low"
      }
    ];
  } catch (error) {
    console.error("Error fetching recent work orders:", error);
    throw error;
  }
};
