import { useCallback } from 'react';
import { tempUuidService } from '@/services/unified/tempUuidService';

export interface UseTempUuidOptions {
  entityType?: string;
  shopId?: string;
  autoRegister?: boolean;
  expirationHours?: number;
}

export function useTempUuid() {
  /**
   * Generate a new UUID with optional registration
   */
  const generateUuid = useCallback((options?: UseTempUuidOptions): string => {
    const uuid = crypto.randomUUID();
    
    if (options?.autoRegister && options?.entityType) {
      tempUuidService.registerTempUuid(
        uuid,
        options.entityType,
        {},
        options.shopId,
        options.expirationHours
      ).catch(error => {
        console.warn('Failed to register temp UUID:', error);
        // Don't throw - UUID generation should succeed even if registration fails
      });
    }
    
    return uuid;
  }, []);

  /**
   * Register an existing UUID for tracking
   */
  const registerUuid = useCallback(async (
    uuid: string,
    entityType: string,
    context?: Record<string, any>,
    shopId?: string,
    expirationHours?: number
  ): Promise<void> => {
    try {
      await tempUuidService.registerTempUuid(
        uuid,
        entityType,
        context,
        shopId,
        expirationHours
      );
    } catch (error) {
      console.error('Failed to register UUID:', error);
      // Don't throw - this is often non-critical
    }
  }, []);

  /**
   * Convert a temporary UUID to permanent
   */
  const convertUuid = useCallback(async (
    tempId: string,
    permanentId: string
  ): Promise<void> => {
    try {
      await tempUuidService.convertTempUuid(tempId, permanentId);
    } catch (error) {
      console.error('Failed to convert UUID:', error);
      // Don't throw - the main operation might have succeeded
    }
  }, []);

  /**
   * Get context for a temporary UUID
   */
  const getUuidContext = useCallback(async (
    tempId: string
  ): Promise<Record<string, any> | null> => {
    try {
      return await tempUuidService.getTempUuidContext(tempId);
    } catch (error) {
      console.error('Failed to get UUID context:', error);
      return null;
    }
  }, []);

  /**
   * Clean up expired UUIDs
   */
  const cleanupExpiredUuids = useCallback(async (): Promise<number> => {
    try {
      return await tempUuidService.cleanupExpiredUuids();
    } catch (error) {
      console.error('Failed to cleanup expired UUIDs:', error);
      return 0;
    }
  }, []);

  return {
    generateUuid,
    registerUuid,
    convertUuid,
    getUuidContext,
    cleanupExpiredUuids
  };
}