
// Re-export interaction service functions from specialized services
export { getCustomerInteractions, getVehicleInteractions, getPendingFollowUps } from './interactions/interactionQueryService';
export { addCustomerInteraction, updateCustomerInteraction, deleteCustomerInteraction, completeFollowUp } from './interactions/interactionMutationService';
