import { supabase } from '@/integrations/supabase/client';

export interface TempUuidRecord {
  tempId: string;
  entityType: string;
  context?: Record<string, any>;
  expiresAt: string;
  convertedToPermanentId?: string;
}

class TempUuidService {
  /**
   * Register a temporary UUID for tracking
   */
  async registerTempUuid(
    tempId: string,
    entityType: string,
    context?: Record<string, any>,
    shopId?: string,
    expirationHours = 24
  ): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const { error } = await supabase
        .from('temp_uuid_registry')
        .insert({
          temp_id: tempId,
          entity_type: entityType,
          context: context || {},
          user_id: userId,
          shop_id: shopId,
          expires_at: new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error registering temp UUID:', error);
      // Don't throw here as this is often non-critical
    }
  }

  /**
   * Convert a temporary UUID to a permanent one
   */
  async convertTempUuid(
    tempId: string,
    permanentId: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('temp_uuid_registry')
        .update({
          converted_to_permanent_id: permanentId,
          converted_at: new Date().toISOString()
        })
        .eq('temp_id', tempId);

      if (error) throw error;
    } catch (error) {
      console.error('Error converting temp UUID:', error);
      // Don't throw here as the main operation might have succeeded
    }
  }

  /**
   * Get context for a temporary UUID
   */
  async getTempUuidContext(tempId: string): Promise<Record<string, any> | null> {
    try {
      const { data, error } = await supabase
        .from('temp_uuid_registry')
        .select('context, entity_type, expires_at')
        .eq('temp_id', tempId)
        .single();

      if (error) throw error;

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        return null;
      }

      return data.context || {};
    } catch (error) {
      console.error('Error getting temp UUID context:', error);
      return null;
    }
  }

  /**
   * Clean up expired temporary UUIDs
   */
  async cleanupExpiredUuids(): Promise<number> {
    try {
      const { data, error } = await supabase
        .rpc('cleanup_expired_temp_uuids');

      if (error) throw error;

      return data || 0;
    } catch (error) {
      console.error('Error cleaning up expired temp UUIDs:', error);
      return 0;
    }
  }

  /**
   * Get temporary UUIDs for a user/shop
   */
  async getUserTempUuids(shopId?: string): Promise<TempUuidRecord[]> {
    try {
      let query = supabase
        .from('temp_uuid_registry')
        .select('temp_id, entity_type, context, expires_at, converted_to_permanent_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (shopId) {
        query = query.eq('shop_id', shopId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(item => ({
        tempId: item.temp_id,
        entityType: item.entity_type,
        context: item.context || {},
        expiresAt: item.expires_at,
        convertedToPermanentId: item.converted_to_permanent_id || undefined
      }));
    } catch (error) {
      console.error('Error getting user temp UUIDs:', error);
      return [];
    }
  }

  /**
   * Generate a new UUID and optionally register it
   */
  generateUuid(entityType?: string, context?: Record<string, any>, shopId?: string): string {
    const uuid = crypto.randomUUID();
    
    // Optionally register it if we have enough context
    if (entityType) {
      this.registerTempUuid(uuid, entityType, context, shopId).catch(() => {
        // Ignore registration errors
      });
    }
    
    return uuid;
  }
}

export const tempUuidService = new TempUuidService();