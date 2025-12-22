import { supabase } from "@/integrations/supabase/client";
import { WishlistItem } from "@/services/wishlistService";

export interface WishlistShare {
  id: string;
  user_id: string;
  share_token: string;
  title: string;
  description?: string;
  is_public: boolean;
  expires_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PriceDropAlert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  current_price: number;
  is_active: boolean;
  notified_at?: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
  };
}

export interface ProductComparison {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  description?: string;
  average_rating?: number;
  review_count?: number;
  stock_quantity?: number;
  specifications?: any;
}

export const enhancedWishlistService = {
  // Share wishlist
  async createWishlistShare(
    userId: string, 
    title: string, 
    description?: string, 
    isPublic = false,
    expiresAt?: string
  ): Promise<WishlistShare> {
    const shareToken = crypto.randomUUID();
    const permissions = JSON.stringify({
      title,
      description: description || '',
      is_public: isPublic
    });

    const { data, error } = await supabase
      .from('wishlist_shares')
      .insert({
        wishlist_owner_id: userId,
        share_token: shareToken,
        shared_with_email: '',
        permissions,
        expires_at: expiresAt || null
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.wishlist_owner_id,
      share_token: data.share_token,
      title,
      description: description || '',
      is_public: isPublic,
      expires_at: data.expires_at || undefined,
      view_count: 0,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  // Get shared wishlist
  async getSharedWishlist(shareToken: string): Promise<{
    share: WishlistShare;
    items: WishlistItem[];
  }> {
    const { data: share, error: shareError } = await supabase
      .from('wishlist_shares')
      .select('*')
      .eq('share_token', shareToken)
      .single();

    if (shareError) throw shareError;

    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      throw new Error('Wishlist share has expired');
    }

    let metadata: { title?: string; description?: string; is_public?: boolean } = {};
    try {
      metadata = JSON.parse(share.permissions || '{}');
    } catch (error) {
      metadata = {};
    }

    const { data: items, error: itemsError } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(
          id,
          name,
          description,
          price,
          image_url,
          sku,
          stock_quantity,
          average_rating,
          review_count
        )
      `)
      .eq('user_id', share.wishlist_owner_id)
      .order('created_at', { ascending: false });

    if (itemsError) throw itemsError;

    return {
      share: {
        id: share.id,
        user_id: share.wishlist_owner_id,
        share_token: share.share_token,
        title: metadata.title || 'Shared Wishlist',
        description: metadata.description || '',
        is_public: Boolean(metadata.is_public),
        expires_at: share.expires_at || undefined,
        view_count: 0,
        created_at: share.created_at,
        updated_at: share.updated_at
      },
      items: items || []
    };
  },

  // Get user's shared wishlists
  async getUserWishlistShares(userId: string): Promise<WishlistShare[]> {
    const { data, error } = await supabase
      .from('wishlist_shares')
      .select('*')
      .eq('wishlist_owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(share => {
      let metadata: { title?: string; description?: string; is_public?: boolean } = {};
      try {
        metadata = JSON.parse(share.permissions || '{}');
      } catch (parseError) {
        metadata = {};
      }

      return {
        id: share.id,
        user_id: share.wishlist_owner_id,
        share_token: share.share_token,
        title: metadata.title || 'Shared Wishlist',
        description: metadata.description || '',
        is_public: Boolean(metadata.is_public),
        expires_at: share.expires_at || undefined,
        view_count: 0,
        created_at: share.created_at,
        updated_at: share.updated_at
      };
    });
  },

  // Delete wishlist share
  async deleteWishlistShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from('wishlist_shares')
      .delete()
      .eq('id', shareId);

    if (error) throw error;
  },

  // Set price drop alert (placeholder)
  async setPriceDropAlert(
    userId: string, 
    productId: string, 
    targetPrice: number
  ): Promise<PriceDropAlert> {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('price')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    const { data, error } = await supabase
      .from('price_drop_alerts')
      .insert({
        user_id: userId,
        product_id: productId,
        target_price: targetPrice,
        current_price: product.price,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      product_id: data.product_id,
      target_price: data.target_price,
      current_price: data.current_price,
      is_active: data.is_active,
      notified_at: data.notified_at || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  // Get user's price drop alerts (placeholder)
  async getPriceDropAlerts(userId: string): Promise<PriceDropAlert[]> {
    const { data, error } = await supabase
      .from('price_drop_alerts')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          image_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(alert => ({
      id: alert.id,
      user_id: alert.user_id,
      product_id: alert.product_id,
      target_price: alert.target_price,
      current_price: alert.current_price,
      is_active: alert.is_active,
      notified_at: alert.notified_at || undefined,
      created_at: alert.created_at,
      updated_at: alert.updated_at,
      product: alert.product
        ? {
            id: alert.product.id,
            name: alert.product.name,
            price: alert.product.price,
            image_url: alert.product.image_url || undefined
          }
        : undefined
    }));
  },

  // Remove price drop alert (placeholder)
  async removePriceDropAlert(alertId: string): Promise<void> {
    const { error } = await supabase
      .from('price_drop_alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
  },

  // Compare products
  async compareProducts(productIds: string[]): Promise<ProductComparison[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        image_url,
        description,
        average_rating,
        review_count,
        stock_quantity
      `)
      .in('id', productIds);

    if (error) throw error;
    return data?.map(item => ({
      ...item,
      specifications: item.description || 'No specifications available'
    })) || [];
  },

  // Get wishlist analytics
  async getWishlistAnalytics(userId: string): Promise<{
    totalItems: number;
    totalValue: number;
    averagePrice: number;
    categoryBreakdown: Record<string, number>;
    priceRangeBreakdown: Record<string, number>;
  }> {
    const { data: items, error } = await supabase
      .from('wishlist_items')
      .select(`
        *,
        product:products(
          id,
          name,
          price
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const totalItems = items?.length || 0;
    const totalValue = items?.reduce((sum, item) => sum + (item.product?.price || 0), 0) || 0;
    const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;

    const categoryBreakdown: Record<string, number> = {};
    const priceRangeBreakdown = {
      'Under $25': 0,
      '$25-$50': 0,
      '$50-$100': 0,
      '$100-$250': 0,
      'Over $250': 0
    };

    items?.forEach(item => {
      const price = item.product?.price || 0;
      const category = 'General'; // Simplified since category doesn't exist on products table

      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;

      if (price < 25) priceRangeBreakdown['Under $25']++;
      else if (price < 50) priceRangeBreakdown['$25-$50']++;
      else if (price < 100) priceRangeBreakdown['$50-$100']++;
      else if (price < 250) priceRangeBreakdown['$100-$250']++;
      else priceRangeBreakdown['Over $250']++;
    });

    return {
      totalItems,
      totalValue,
      averagePrice,
      categoryBreakdown,
      priceRangeBreakdown
    };
  }
};
