
import { supabase } from "@/integrations/supabase/client";
import { Wishlist, Product } from "@/types/shopping";

export async function getWishlistItems(): Promise<Product[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  // Get wishlist items with product details
  const { data, error } = await (supabase as any)
    .from('user_wishlists')
    .select(`
      id,
      product_id,
      created_at,
      products (*)
    `)
    .eq('user_id', user.id);

  if (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }

  // Extract products from the joined result
  return data.map(item => item.products) || [];
}

export async function addToWishlist(productId: string): Promise<Wishlist> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to add to wishlist");
  }

  const { data, error } = await (supabase as any)
    .from('user_wishlists')
    .insert({
      user_id: user.id,
      product_id: productId
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }

  return data;
}

export async function removeFromWishlist(productId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to remove from wishlist");
  }

  const { error } = await (supabase as any)
    .from('user_wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { data, error } = await (supabase as any)
    .from('user_wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return false; // Not found in wishlist
    }
    console.error("Error checking wishlist:", error);
    throw error;
  }

  return !!data;
}
