
// This file re-exports useWorkOrderStatusManagement to maintain compatibility
// with existing components while we refactor
import { useWorkOrderStatusManagement } from "./useWorkOrderStatusManagement";

// Re-export the hook with the old name for compatibility
export const useWorkOrderStatusManager = useWorkOrderStatusManagement;
