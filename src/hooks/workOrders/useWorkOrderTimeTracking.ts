
// This file re-exports useWorkOrderTimeManagement to maintain compatibility
// with existing components while we refactor
import { useWorkOrderTimeManagement } from "./useWorkOrderTimeManagement";

// Re-export the hook with the old name for compatibility
export const useWorkOrderTimeTracking = useWorkOrderTimeManagement;
