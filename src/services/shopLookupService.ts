import { supabase } from '@/lib/supabase';

export interface ShopPublicInfo {
  id: string;
  name: string;
  slug: string;
  invite_code: string;
  logo_url?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
}

/**
 * Look up a shop by its URL slug
 */
export async function getShopBySlug(slug: string): Promise<ShopPublicInfo | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, invite_code, logo_url, address, city, state, phone')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Shop lookup by slug failed:', error);
    return null;
  }

  return data;
}

/**
 * Look up a shop by its invite code (case-insensitive)
 */
export async function getShopByInviteCode(code: string): Promise<ShopPublicInfo | null> {
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, invite_code, logo_url, address, city, state, phone')
    .ilike('invite_code', code.trim())
    .single();

  if (error || !data) {
    console.error('Shop lookup by invite code failed:', error);
    return null;
  }

  return data;
}

/**
 * Search shops by name for directory search
 */
export async function searchShops(query: string, limit = 10): Promise<ShopPublicInfo[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, invite_code, logo_url, address, city, state, phone')
    .ilike('name', `%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Shop search failed:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all public shops for directory listing
 */
export async function getAllShops(limit = 50): Promise<ShopPublicInfo[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, slug, invite_code, logo_url, address, city, state, phone')
    .limit(limit);

  if (error) {
    console.error('Get all shops failed:', error);
    return [];
  }

  return data || [];
}
