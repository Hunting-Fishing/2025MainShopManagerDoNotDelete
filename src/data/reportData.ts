
export const reportData = {
  salesData: [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
    { month: 'Jul', revenue: 3490, expenses: 4300 },
    { month: 'Aug', revenue: 2490, expenses: 2300 },
    { month: 'Sep', revenue: 3490, expenses: 1300 },
    { month: 'Oct', revenue: 4490, expenses: 2300 },
    { month: 'Nov', revenue: 3490, expenses: 3300 },
    { month: 'Dec', revenue: 4490, expenses: 2800 },
  ],

  workOrderStatusData: [
    { name: 'Completed', value: 65, color: '#0ea5e9' },
    { name: 'In Progress', value: 25, color: '#f97316' },
    { name: 'Pending', value: 10, color: '#8b5cf6' },
  ],

  topSellingItems: [
    { id: 1, name: 'Oil Change Service', quantity: 120, revenue: 3600 },
    { id: 2, name: 'Brake Pad Replacement', quantity: 85, revenue: 8500 },
    { id: 3, name: 'Tire Rotation', quantity: 78, revenue: 1950 },
    { id: 4, name: 'Engine Tune-up', quantity: 65, revenue: 9750 },
    { id: 5, name: 'Air Filter Replacement', quantity: 62, revenue: 1240 },
  ],

  servicePerformance: [
    { month: 'Jan', completedOnTime: 45, delayed: 5 },
    { month: 'Feb', completedOnTime: 50, delayed: 3 },
    { month: 'Mar', completedOnTime: 60, delayed: 7 },
    { month: 'Apr', completedOnTime: 55, delayed: 4 },
    { month: 'May', completedOnTime: 65, delayed: 2 },
    { month: 'Jun', completedOnTime: 70, delayed: 5 },
  ],

  comparisonRevenueData: [
    { 
      name: 'Total Revenue', 
      current: 35890, 
      previous: 30450, 
      change: 18 
    },
    { 
      name: 'Service Revenue', 
      current: 28500, 
      previous: 24100, 
      change: 18 
    },
    { 
      name: 'Parts Revenue', 
      current: 7390, 
      previous: 6350, 
      change: 16 
    },
    { 
      name: 'Average Ticket', 
      current: 450, 
      previous: 410, 
      change: 10 
    }
  ],

  comparisonServiceData: [
    { 
      name: 'Work Orders', 
      current: 87, 
      previous: 80, 
      change: 9 
    },
    { 
      name: 'Completion Rate', 
      current: 92, 
      previous: 88, 
      change: 5 
    },
    { 
      name: 'On-Time Rate', 
      current: 85, 
      previous: 82, 
      change: 4 
    },
    { 
      name: 'Customer Satisfaction', 
      current: 4.8, 
      previous: 4.6, 
      change: 4 
    }
  ],

  inventoryData: {
    statusData: [
      { name: 'In Stock', value: 72, color: '#10b981' },
      { name: 'Low Stock', value: 18, color: '#f97316' },
      { name: 'Out of Stock', value: 10, color: '#ef4444' },
    ],
    turnoverData: [
      { month: 'Jan', turnover: 3.2 },
      { month: 'Feb', turnover: 3.4 },
      { month: 'Mar', turnover: 3.8 },
      { month: 'Apr', turnover: 3.5 },
      { month: 'May', turnover: 3.9 },
      { month: 'Jun', turnover: 4.2 },
    ],
    lowStockItems: [
      { name: 'Oil Filter (Type A)', currentStock: 5, reorderLevel: 10, status: 'Low Stock' },
      { name: 'Brake Pads (Front)', currentStock: 3, reorderLevel: 8, status: 'Low Stock' },
      { name: 'Windshield Wiper Fluid', currentStock: 2, reorderLevel: 12, status: 'Low Stock' },
      { name: 'Air Filter (Standard)', currentStock: 0, reorderLevel: 15, status: 'Out of Stock' },
    ]
  }
};
