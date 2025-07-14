// Placeholder services for Phase 5C features
// These will be fully functional once the database types are updated

export const placeholderOrderTracking = {
  getOrderTracking: async (orderId: string) => [],
  addTrackingUpdate: async (orderId: string, update: any) => ({}),
  subscribeToTrackingUpdates: (orderId: string, callback: Function) => ({ unsubscribe: () => {} })
};

export const placeholderNotifications = {
  getUserNotifications: async (userId: string) => [],
  getUnreadCount: async (userId: string) => 0,
  markAsRead: async (notificationId: string) => {},
  markAllAsRead: async (userId: string) => {},
  createNotification: async (notification: any) => ({}),
  getNotificationPreferences: async (userId: string) => ({
    id: '1',
    user_id: userId,
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    order_updates: true,
    price_alerts: true,
    marketing: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }),
  updateNotificationPreferences: async (userId: string, preferences: any) => ({}),
  subscribeToNotifications: (userId: string, callback: Function) => ({ unsubscribe: () => {} })
};

export const placeholderSupport = {
  getUserTickets: async (userId: string) => [],
  getTicket: async (ticketId: string) => ({}),
  createTicket: async (userId: string, ticket: any) => ({}),
  getTicketMessages: async (ticketId: string) => [],
  sendMessage: async (userId: string, message: any) => ({}),
  updateTicketStatus: async (ticketId: string, status: string) => ({}),
  subscribeToTicketUpdates: (ticketId: string, callback: Function) => ({ unsubscribe: () => {} }),
  subscribeToTicketMessages: (ticketId: string, callback: Function) => ({ unsubscribe: () => {} })
};