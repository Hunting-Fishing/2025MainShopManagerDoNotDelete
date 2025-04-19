
// Export all activity tracking functions from this index file
export * from './workOrderActivity';
export * from './communicationActivity';
export * from './technicianActivity';

// Re-export getFlaggedActivities from flaggedActivity instead of workOrderActivity
// to resolve the ambiguity
export * from './flaggedActivity';
